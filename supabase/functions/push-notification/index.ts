import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import admin from "npm:firebase-admin@11.11.0";

// Ensure Firebase is initialized only once
if (!admin.apps.length) {
  try {
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT secret is not set.");
    }
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received Webhook Payload:", JSON.stringify(payload));

    // Supabase Webhook payload format
    // { type: 'INSERT', table: 'notifications', record: { ... } }
    const record = payload.record;
    if (!record || payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: "Ignored non-insert event" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { recipient_id, actor_id, type } = record;
    if (!recipient_id) {
      throw new Error("No recipient_id found in notification record");
    }

    // Initialize Supabase Client to fetch push tokens
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase env vars.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch user tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', recipient_id);

    if (tokensError) {
      console.error("Error fetching tokens:", tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log(`No push tokens found for user ${recipient_id}`);
      return new Response(JSON.stringify({ message: "No tokens found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch actor info to build a nice message
    const { data: actorProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', actor_id)
      .single();

    if (profileError) {
      console.error("Error fetching actor profile:", profileError);
    }

    let actorName = actorProfile?.display_name || actorProfile?.username || actorProfile?.name || actorProfile?.full_name || '';
    const imageUrl = actorProfile?.profile_image_url || actorProfile?.avatar_url || null;

    // VERY IMPORTANT FALLBACK: If the profile is empty or has no name, fetch their email!
    if (!actorName || actorName.trim() === '') {
      const { data: authUser } = await supabase.auth.admin.getUserById(actor_id);
      if (authUser?.user?.email) {
        actorName = authUser.user.email.split('@')[0]; // Use the first part of their email
      } else {
        actorName = 'Someone'; // Absolute last resort
      }
    }

    let title = actorName || 'Crimchart';
    let body = '';

    if (record.action_text) {
      body = record.action_text;
    } else {
      switch (type) {
        case 'like':
          body = `liked your post.`;
          break;
        case 'comment':
          body = `commented on your post.`;
          break;
        case 'follow':
          body = `started following you.`;
          break;
        case 'channel_invite':
          body = `invited you to a channel.`;
          break;
        case 'channel_request':
          body = `requested to join your channel.`;
          break;
        case 'mention':
          body = `mentioned you.`;
          break;
        case 'post_tag':
          body = `tagged you in a post.`;
          break;
        default:
          body = `interacted with you.`;
          break;
      }
    }

    // Try to fetch the post image for the action image
    let postImageUrl = null;
    if (record.reference_id && (type === 'like' || type === 'comment' || type === 'post_tag' || type === 'mention')) {
      const { data: post } = await supabase.from('posts').select('media_urls').eq('id', record.reference_id).single();
      if (post?.media_urls && post.media_urls.length > 0) {
        postImageUrl = post.media_urls[0];
      } else {
        const { data: channelPost } = await supabase.from('channel_posts').select('media_urls').eq('id', record.reference_id).single();
        if (channelPost?.media_urls && channelPost.media_urls.length > 0) {
          postImageUrl = channelPost.media_urls[0];
        }
      }
    }

    const allTokens = tokens.map((t: any) => t.token);
    console.log(`Processing ${allTokens.length} tokens...`);

    const expoTokens = allTokens.filter((t: string) => t.startsWith('ExponentPushToken') || t.startsWith('ExpoPushToken'));
    const fcmTokens = allTokens.filter((t: string) => !t.startsWith('ExponentPushToken') && !t.startsWith('ExpoPushToken'));

    let successCount = 0;
    let failureCount = 0;

    // 3a. Send to Expo Push API (Mobile)
    if (expoTokens.length > 0) {
      console.log(`Sending to ${expoTokens.length} Expo tokens...`);
      const expoMessages = expoTokens.map((token: string) => {
        const msg: any = {
          to: token,
          sound: 'default',
          title,
          body,
          data: { 
            type: type, 
            path: '/notifications',
            title: title,
            body: body,
            imageUrl: imageUrl,
            postImageUrl: postImageUrl
          },
        };
        return msg;
      });

      try {
        const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expoMessages),
        });
        const expoData = await expoRes.json();
        console.log("Expo Push Response:", expoData);
        // We consider the batch sent successfully to Expo
        successCount += expoTokens.length;
      } catch (error) {
        console.error("Expo Push Error:", error);
        failureCount += expoTokens.length;
      }
    }

    // 3b. Send to Firebase Cloud Messaging (Web/Chrome/Android FCM)
    if (fcmTokens.length > 0) {
      console.log(`Sending to ${fcmTokens.length} FCM tokens...`);
      const sendPromises = fcmTokens.map(async (token: string) => {
        // We use a Data-Only message so that Notifee can catch it in the background 
        // without the Android OS rendering a default (image-less) notification.
        const message: any = {
          data: { 
            type: type, 
            path: '/notifications',
            title: title,
            body: body
          },
          token: token,
        };

        if (imageUrl) {
          message.data.imageUrl = imageUrl;
        }
        if (postImageUrl) {
          message.data.postImageUrl = postImageUrl;
        }

        try {
          await admin.messaging().send(message);
          successCount++;
        } catch (error: any) {
          failureCount++;
          console.error(`Failed to send to FCM token ${token}:`, error);
          // If the token is no longer registered or is invalid, remove it from our database
          if (
            error?.errorInfo?.code === 'messaging/registration-token-not-registered' ||
            error?.errorInfo?.code === 'messaging/invalid-registration-token'
          ) {
            console.log(`Removing invalid FCM token from database: ${token}`);
            await supabase.from('user_push_tokens').delete().eq('token', token);
          }
        }
      });

      await Promise.all(sendPromises);
    }

    console.log(`Successfully sent ${successCount} messages; failed ${failureCount}`);

    return new Response(JSON.stringify({ success: true, count: successCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
