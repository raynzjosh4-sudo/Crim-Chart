const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://mrcynipmpismyneyhdwh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3luaXBtcGlzbXluZXloZHdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1MzE0MywiZXhwIjoyMDg5OTI5MTQzfQ.zYdQBOHcRKkwG3CMcL2ZwnDkQINXDu74kqrfalkjTnc');

async function run() {
  const query = `
    DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;
    CREATE POLICY "Posts are publicly readable" ON public.posts FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Channel posts are publicly readable" ON public.channel_posts;
    CREATE POLICY "Channel posts are publicly readable" ON public.channel_posts FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Crimchart posts are publicly readable" ON public.crimchart_posts;
    CREATE POLICY "Crimchart posts are publicly readable" ON public.crimchart_posts FOR SELECT USING (true);
  `;
  
  const { data, error } = await s.rpc('execute_sql', { query });
  console.log('Result:', { data, error });
}

run();
