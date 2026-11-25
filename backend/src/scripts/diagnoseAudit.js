import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSchemaAndData() {
  console.log('--- Checking Matches Table Rows ---');
  const { data: matches, error: mErr } = await supabase.from('matches').select('*');
  console.log('Matches rows count:', matches?.length, mErr || '');
  if (matches?.length) {
    console.log('Sample match:', matches[0]);
  }

  console.log('\n--- Checking Notifications Constraints ---');
  // Attempt to test types
  const types = ['swap_request_received', 'swap_request_accepted', 'swap_request_rejected', 'new_message', 'session_scheduled', 'session_rescheduled', 'session_cancelled', 'session_completed', 'session_reminder', 'review_received', 'system'];
  for (const t of types) {
    const { error } = await supabase.from('notifications').insert({
      user_id: 'cc6bb12c-6373-4c99-a5e3-a774f5844019',
      type: t,
      title: 'Test',
      body: 'Test',
      is_read: true,
    }).select();
    console.log(`Type "${t}":`, error ? `FAILED: ${error.message}` : 'ALLOWED');
  }

  // Clean up test notifications
  await supabase.from('notifications').delete().eq('title', 'Test');

  console.log('\n--- Checking Completed Sessions ---');
  const { data: sessions } = await supabase.from('sessions').select('id, status, title').order('created_at', { ascending: false }).limit(3);
  console.log('Latest 3 sessions:', sessions);
}

checkSchemaAndData();
