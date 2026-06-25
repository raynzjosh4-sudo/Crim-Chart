const { createClient } = require('@supabase/supabase-js');
const url = 'https://mrcynipmpismyneyhdwh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3luaXBtcGlzbXluZXloZHdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1MzE0MywiZXhwIjoyMDg5OTI5MTQzfQ.zYdQBOHcRKkwG3CMcL2ZwnDkQINXDu74kqrfalkjTnc';

const supabase = createClient(url, key);

async function run() {
  const { error } = await supabase.rpc('execute_sql', { query: "NOTIFY pgrst, 'reload schema';" });
  console.log('Reload Schema error:', error);
}

run();
