import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Testing Supabase Auth with live project:', supabaseUrl);
  
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testEmail = `skillswap_tester_${randomSuffix}@gmail.com`;
  const testPassword = 'SkillSwap2026!Secure';

  console.log('Attempting sign up with:', testEmail);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Alex Rivera',
        username: `alex_rivera_${randomSuffix}`,
      },
    },
  });

  if (signUpError) {
    console.error('Sign up error:', signUpError.message);
    process.exit(1);
  }

  console.log('✅ Sign up successful!');
  console.log('User ID:', signUpData.user?.id);
  console.log('Email:', signUpData.user?.email);
  console.log('Session present directly?', Boolean(signUpData.session));

  console.log('\nTesting sign in with test credentials...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.log('Sign in note:', signInError.message);
  } else {
    console.log('✅ Sign in successful! Logged in user:', signInData.user?.email);
  }

  // Check if profile was created by trigger
  console.log('\nChecking public.profiles table for user...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user?.id)
    .single();

  if (profileError) {
    console.log('Profile query note:', profileError.message);
  } else {
    console.log('✅ Profile found in public.profiles:');
    console.log('Username:', profile.username);
    console.log('Full name:', profile.full_name);
    console.log('Onboarding completed?', profile.onboarding_completed);
  }

  process.exit(0);
}

testAuth();
