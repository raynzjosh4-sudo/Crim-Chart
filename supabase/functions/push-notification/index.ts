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
    const { data: actorProfile } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', actor_id)
      .single();

    const actorName = actorProfile?.display_name || actorProfile?.username || 'Someone';

    let title = 'New Notification';
    let body = 'You have a new notification.';

    switch (type) {
      case 'like':
        title = 'New Like ❤️';
        body = `${actorName} liked your post.`;
        break;
      case 'comment':
        title = 'New Comment 💬';
        body = `${actorName} commented on your post.`;
        break;
      case 'follow':
        title = 'New Follower 👤';
        body = `${actorName} started following you.`;
        break;
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
      const expoMessages = expoTokens.map((token: string) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: { type: type, path: '/notifications' },
      }));

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

    // 3b. Send to Firebase Cloud Messaging (Web/Chrome)
    if (fcmTokens.length > 0) {
      console.log(`Sending to ${fcmTokens.length} FCM tokens...`);
      const sendPromises = fcmTokens.map(async (token: string) => {
        const message = {
          notification: { title, body },
          data: { type: type, path: '/notifications' },
          token: token,
        };

        try {
          await admin.messaging().send(message);
          successCount++;
        } catch (error: any) {
          failureCount++;
          console.error(`Failed to send to FCM token ${token}:`, error);
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
