require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('boxes')
    .select(`
      id,
      title,
      owner:profiles!owner_id (id, display_name),
      box_items (
        id,
        likes_count,
        post:posts (id, title, metadata)
      )
    `)
    .order('likes_count', { foreignTable: 'box_items', ascending: false })
    .limit(2, { foreignTable: 'box_items' })
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
}

test();
