import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("1. Edge Function Triggered!");
    const { videoFilename, userId } = await req.json();

    if (!videoFilename || !userId) {
      throw new Error("Missing videoFilename or userId");
    }

    const GITHUB_PAT = Deno.env.get('GITHUB_PAT');
    if (!GITHUB_PAT) {
      throw new Error("Missing GITHUB_PAT in Supabase Secrets!");
    }

    const GITHUB_OWNER = 'raynzjosh4-sudo';
    const GITHUB_REPO = 'Crim-Chart';

    console.log("2. Triggering GitHub Actions workflow...");

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${GITHUB_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'transcode-video',
          client_payload: {
            videoFilename,
            userId
          }
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${text}`);
    }

    const cleanFolderName = videoFilename.replace('.mp4', '');

    console.log("3. Workflow triggered! Returning URLs.");
    return new Response(JSON.stringify({
      success: true,
      jobId: `gh_${Date.now()}`,
      // HLS will be ready in ~1-3 minutes as GitHub Actions processes it
      streamUrl: `https://cdn.crimchart.com/processed/${userId}/videos/${cleanFolderName}/hls/playlist.m3u8`,
      thumbnailUrl: `https://cdn.crimchart.com/raw/${videoFilename}`
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("EDGE FUNCTION CRASHED:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
