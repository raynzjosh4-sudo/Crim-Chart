const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://mrcynipmpismyneyhdwh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3luaXBtcGlzbXluZXloZHdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1MzE0MywiZXhwIjoyMDg5OTI5MTQzfQ.zYdQBOHcRKkwG3CMcL2ZwnDkQINXDu74kqrfalkjTnc');

supabase.rpc('run_sql', { query: "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_likes';" }).then(r => console.log('post_likes RLS?', r.data || r.error));
