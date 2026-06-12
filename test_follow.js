const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://mrcynipmpismyneyhdwh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3luaXBtcGlzbXluZXloZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTMxNDMsImV4cCI6MjA4OTkyOTE0M30.8yR4BZ4bMDHTQJCVRKnM_sFTGpw6xJAsdmzpRhb0gpo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const channel_id = '00000000-0000-0000-0000-000000000000'; // dummy UUID
  const { data, error } = await supabase.rpc('follow_channel', { channel_id });
  console.log('RPC result:', { data, error });
}
run();
