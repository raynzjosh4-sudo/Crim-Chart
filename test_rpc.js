const { createClient } = require('@supabase/supabase-js');
const url = 'https://mrcynipmpismyneyhdwh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3luaXBtcGlzbXluZXloZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTMxNDMsImV4cCI6MjA4OTkyOTE0M30.8yR4BZ4bMDHTQJCVRKnM_sFTGpw6xJAsdmzpRhb0gpo';

const supabase = createClient(url, key);

async function test() {
  try {
    console.log('Fetching get_top_liked_music...');
    const { data, error } = await supabase.rpc('get_top_liked_music', { p_limit: 20, p_offset: 0 });
    console.log('Error:', error);
    console.log('Data:', data ? data.length + ' items' : data);
  } catch(e) {
    console.error('Exception:', e);
  }
}
test();
