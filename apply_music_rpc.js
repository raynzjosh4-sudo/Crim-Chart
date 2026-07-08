const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const url = 'https://mrcynipmpismyneyhdwh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3luaXBtcGlzbXluZXloZHdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1MzE0MywiZXhwIjoyMDg5OTI5MTQzfQ.zYdQBOHcRKkwG3CMcL2ZwnDkQINXDu74kqrfalkjTnc';

const supabase = createClient(url, key);

async function run() {
  try {
    const sqlContent = fs.readFileSync('./src/sql/get_top_liked_music.sql', 'utf8');
    const { data, error } = await supabase.rpc('execute_sql', { query: sqlContent });
    if (error) {
      console.error('Error applying SQL:', error);
    } else {
      console.log('Successfully applied SQL!');
      
      // Also reload schema
      const { error: reloadError } = await supabase.rpc('execute_sql', { query: "NOTIFY pgrst, 'reload schema';" });
      if (reloadError) console.error('Error reloading schema:', reloadError);
      else console.log('Schema reloaded successfully.');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

run();
