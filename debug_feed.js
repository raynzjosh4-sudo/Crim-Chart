const { createClient } = require('@supabase/supabase-js');
const url = 'https://mrcynipmpismyneyhdwh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3luaXBtcGlzbXluZXloZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTMxNDMsImV4cCI6MjA4OTkyOTE0M30.8yR4BZ4bMDHTQJCVRKnM_sFTGpw6xJAsdmzpRhb0gpo';

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.rpc('get_mixed_feed', {
    p_user_id: null,
    p_limit: 15,
    p_offset: 0
  });

  console.log('Result for null:', data, error);

  const { data: data2, error: err2 } = await supabase.rpc('get_mixed_feed', {
    p_user_id: '00000000-0000-0000-0000-000000000000',
    p_limit: 15,
    p_offset: 0
  });

  console.log('Result for fake user:', data2, err2);
}

test();
