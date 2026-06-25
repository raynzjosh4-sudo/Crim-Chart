import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('EXPO_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('EXPO_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const postId = '5d29f785-e2bd-4b66-9349-d3267ef75b5e';
  
  const { data: commentsData } = await supabase.from('comments').select('*').eq('post_id', postId);
  console.log('--- COMMENTS FOR THIS POST ---');
  console.log(JSON.stringify(commentsData, null, 2));
}

main();
