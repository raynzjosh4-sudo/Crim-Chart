const { createClient } = require('@supabase/supabase-js');
const url = 'https://mrcynipmpismyneyhdwh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY3luaXBtcGlzbXluZXloZHdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM1MzE0MywiZXhwIjoyMDg5OTI5MTQzfQ.zYdQBOHcRKkwG3CMcL2ZwnDkQINXDu74kqrfalkjTnc';

const supabase = createClient(url, key);

async function backfill() {
  console.log('Fetching users...');
  const { data: users, error: userErr } = await supabase.from('profiles').select('id');
  if (userErr || !users) {
    console.error('Failed to fetch users', userErr);
    return;
  }
  const userIds = users.map(u => u.id);
  console.log(`Found ${userIds.length} users.`);

  console.log('Fetching posts...');
  const { data: posts, error: postErr } = await supabase
    .from('channel_posts')
    .select('id, author_id, is_video, is_audio, created_at')
    .limit(50)
    .order('created_at', { ascending: false });

  if (postErr || !posts) {
    console.error('Failed to fetch posts', postErr);
    return;
  }
  console.log(`Found ${posts.length} posts.`);

  const pointers = [];
  for (const user of userIds) {
    for (const post of posts) {
      let entity_type = 'standard_post';
      if (post.is_video) entity_type = 'video_post';
      else if (post.is_audio) entity_type = 'audio_post';

      pointers.push({
        target_user_id: user,
        entity_type: entity_type,
        entity_id: post.id,
        created_at: post.created_at
      });
    }
  }

  console.log(`Inserting ${pointers.length} pointers...`);
  // Insert in batches
  for (let i = 0; i < pointers.length; i += 100) {
    const batch = pointers.slice(i, i + 100);
    const { error: insErr } = await supabase.from('user_feed_pointers').insert(batch);
    if (insErr) {
      console.error('Batch insert error', insErr);
    }
  }

  console.log('Backfill complete!');
}

backfill();
