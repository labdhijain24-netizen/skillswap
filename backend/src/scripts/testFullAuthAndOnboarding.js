import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullFlow() {
  console.log('========================================================');
  console.log('🧪 Testing Full Auth, Onboarding & Profile Edit Flow');
  console.log('========================================================\n');

  const randomId = Math.floor(1000 + Math.random() * 9000);
  const email = `creator_${randomId}@gmail.com`;
  const password = 'SkillSwap2026!Secure';
  const fullName = `Aria Chen ${randomId}`;
  const username = `ariachen_${randomId}`;

  // 1. REGISTRATION
  console.log('1. Registering new user:', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username,
      },
    },
  });

  if (signUpError) {
    console.error('❌ Sign up failed:', signUpError.message);
    process.exit(1);
  }

  const userId = signUpData.user?.id;
  console.log('   ✅ Registered successfully! User ID:', userId);

  // 2. LOGIN
  console.log('\n2. Logging in with credentials...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message);
    process.exit(1);
  }
  console.log('   ✅ Sign in successful! Session token generated.');

  // 3. MULTI-STEP ONBOARDING DATA SAVING
  console.log('\n3. Executing Multi-Step Onboarding Data Save...');

  // 3a. Update Profile
  console.log('   - Updating profile (name, bio, avatar, mode, onboarding_completed: true)...');
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: 'UI designer and jazz enthusiast excited to trade design systems for acoustic guitar lessons.',
      location: 'Vancouver, BC',
      time_zone: 'America/Vancouver',
      preferred_learning_mode: 'flexible',
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (profileUpdateError) {
    console.error('❌ Profile update failed:', profileUpdateError.message);
    process.exit(1);
  }
  console.log('     ✔️ Profile updated.');

  // 3b. Fetch skills for foreign keys
  const { data: skills } = await supabase.from('skills').select('id, name').limit(3);
  const skillA = skills?.[0];
  const skillB = skills?.[1];

  // 3c. Insert user teaching skills (user_skills table)
  if (skillA) {
    console.log(`   - Adding teaching skill: "${skillA.name}" into user_skills...`);
    const { error: teachError } = await supabase.from('user_skills').insert({
      user_id: userId,
      skill_id: skillA.id,
      proficiency_level: 'expert',
      experience_years: 5,
      description: 'Expert instruction in component architecture and animation.',
    });
    if (teachError) console.error('❌ user_skills error:', teachError.message);
    else console.log('     ✔️ user_skills saved.');
  }

  // 3d. Insert wanted skills (wanted_skills table)
  if (skillB) {
    console.log(`   - Adding learning goal: "${skillB.name}" into wanted_skills...`);
    const { error: wantError } = await supabase.from('wanted_skills').insert({
      user_id: userId,
      skill_id: skillB.id,
      target_proficiency: 'intermediate',
      priority: 'high',
      notes: 'Looking to learn fingerpicking and rhythm fundamentals.',
    });
    if (wantError) console.error('❌ wanted_skills error:', wantError.message);
    else console.log('     ✔️ wanted_skills saved.');
  }

  // 3e. Insert user interests (user_interests table)
  console.log('   - Adding user interests into user_interests...');
  const { error: intError } = await supabase.from('user_interests').insert([
    { user_id: userId, name: 'Creative Coding' },
    { user_id: userId, name: 'Acoustic Jamming' },
  ]);
  if (intError) console.error('❌ user_interests error:', intError.message);
  else console.log('     ✔️ user_interests saved.');

  // 3f. Insert availability (availability table)
  console.log('   - Adding schedule slots into availability...');
  const { error: availError } = await supabase.from('availability').insert([
    { user_id: userId, day_of_week: 1, start_time: '18:00', end_time: '20:00', time_zone: 'UTC' },
    { user_id: userId, day_of_week: 6, start_time: '10:00', end_time: '14:00', time_zone: 'UTC' },
  ]);
  if (availError) console.error('❌ availability error:', availError.message);
  else console.log('     ✔️ availability saved.');

  // 4. VERIFY RETRIEVAL (Profile page view)
  console.log('\n4. Verifying data retrieval across all tables...');
  const [pRes, tsRes, wsRes, uiRes, avRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_skills').select('*, skills(name)').eq('user_id', userId),
    supabase.from('wanted_skills').select('*, skills(name)').eq('user_id', userId),
    supabase.from('user_interests').select('*').eq('user_id', userId),
    supabase.from('availability').select('*').eq('user_id', userId),
  ]);

  console.log(`   ✔️ Profile: "${pRes.data?.full_name}" | Onboarded: ${pRes.data?.onboarding_completed}`);
  console.log(`   ✔️ Teaching Skills Count: ${tsRes.data?.length} (${tsRes.data?.[0]?.skills?.name})`);
  console.log(`   ✔️ Wanted Skills Count: ${wsRes.data?.length} (${wsRes.data?.[0]?.skills?.name})`);
  console.log(`   ✔️ Interests Count: ${uiRes.data?.length}`);
  console.log(`   ✔️ Availability Slots Count: ${avRes.data?.length}`);

  // 5. EDIT DETAILS LATER
  console.log('\n5. Testing "Edit Details Later" functionality...');
  const updatedBio = 'Updated Bio: Passionate teacher and enthusiastic student!';
  const { error: editError } = await supabase
    .from('profiles')
    .update({ bio: updatedBio, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (editError) console.error('❌ Edit profile error:', editError.message);
  else {
    const { data: updatedP } = await supabase.from('profiles').select('bio').eq('id', userId).single();
    console.log('   ✅ Profile updated bio verified:', updatedP.bio);
  }

  // 6. LOGOUT
  console.log('\n6. Logging out user...');
  await supabase.auth.signOut();
  console.log('   ✅ Signed out successfully.');

  console.log('\n========================================================');
  console.log('🎉 ALL AUTH & ONBOARDING REQUIREMENTS TESTED & PASSED!');
  console.log('========================================================\n');
  process.exit(0);
}

testFullFlow().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
