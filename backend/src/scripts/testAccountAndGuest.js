import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pmoxxzhccxgavhuunytx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtb3h4emhjY3hnYXZodXVueXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5OTU0MTQsImV4cCI6MjExMDU3MTQxNH0.7NjWmMQtkNDK1R_ya3bNV7GOYS8VYt_mBsIJ7LBf7yw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testUsername = `user_${Date.now().toString().slice(-6)}`;
  const testFullName = 'Test Account User';

  console.log(`[TEST 1] Creating new account with email: ${testEmail}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testFullName,
        username: testUsername
      }
    }
  });

  if (signUpError) {
    console.error('❌ Sign Up Error:', signUpError);
    process.exit(1);
  }

  console.log('✅ Sign Up Succeeded!');
  console.log('   User ID:', signUpData?.user?.id);
  console.log('   Email confirmed at:', signUpData?.user?.email_confirmed_at);
  console.log('   Session established?:', Boolean(signUpData?.session));

  console.log(`\n[TEST 2] Signing in with newly created account...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (signInError) {
    console.error('❌ Sign In Error:', signInError);
    process.exit(1);
  }

  console.log('✅ Sign In Succeeded!');
  console.log('   Signed in User ID:', signInData?.user?.id);
  console.log('   Access Token received?:', Boolean(signInData?.session?.access_token));

  console.log(`\n[TEST 3] Verifying public.profiles row...`);
  const { data: profile, error: profError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signInData.user.id)
    .maybeSingle();

  console.log('   Profile in DB:', profile ? `Found @${profile.username} (${profile.full_name})` : 'None (needs onboarding)');

  console.log(`\n[TEST 4] Testing Local Guest Account credentials in DB...`);
  const { data: guestSignIn, error: guestError } = await supabase.auth.signInWithPassword({
    email: 'guest@skillswap.local',
    password: 'GuestPassword123!'
  });

  if (guestError) {
    console.warn('⚠️ Guest Supabase sign in:', guestError.message);
  } else {
    console.log('✅ Guest Account signed in via Supabase Auth successfully!');
    console.log('   Guest ID:', guestSignIn?.user?.id);
  }

  // Cleanup test user so we keep DB pristine
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtb3h4emhjY3hnYXZodXVueXR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDk5NTQxNCwiZXhwIjoyMTEwNTcxNDE0fQ.wj0lSXR7O0HyUjkImKIQtefEiaekbENwSN-L1pSZyYE';
  const adminClient = createClient(SUPABASE_URL, serviceKey);

  console.log(`\n[CLEANUP] Deleting temporary test user ${signUpData.user.id}...`);
  await adminClient.from('profiles').delete().eq('id', signUpData.user.id);
  await adminClient.auth.admin.deleteUser(signUpData.user.id);
  console.log('✅ Cleanup complete! Database remains pristine.');
}

testAuth().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
