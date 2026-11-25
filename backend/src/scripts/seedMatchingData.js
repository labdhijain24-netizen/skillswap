import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration in .env');
  process.exit(1);
}

// Sample swapper accounts designed for reciprocal matches
const ACCOUNTS = [
  {
    email: 'maya.lin.design@gmail.com',
    password: 'Password123!',
    username: 'maya_design',
    fullName: 'Maya Lin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Brand designer & typography nerd. I design visual identities for startups and want to dive deep into backend scripts and Python data processing.',
    location: 'San Francisco, CA',
    learningMode: 'flexible',
    teaching: [
      { name: 'Graphic Design with Photoshop', level: 'expert', years: 5, desc: 'Master layer blending, color grading, masks, and digital branding assets.' },
      { name: 'UI/UX Design in Figma', level: 'expert', years: 4.5, desc: 'Design systems, nested auto-layout, token structures, and interactive prototypes.' },
    ],
    wanted: [
      { name: 'Python', level: 'beginner', priority: 'high', notes: 'Want to automate SVG asset pipelines and build data scrapers.' },
      { name: 'Acoustic Guitar', level: 'beginner', priority: 'medium', notes: 'Learn campfire chords and fingerstyle accompaniment.' },
    ],
    interests: ['Creative Coding', 'Film Photography', 'UI Design Systems'],
    availability: [
      { day: 1, start: '18:00', end: '21:00' }, // Mon
      { day: 3, start: '18:00', end: '21:00' }, // Wed
      { day: 6, start: '10:00', end: '14:00' }, // Sat
    ],
  },
  {
    email: 'lucas.vance.dev@gmail.com',
    password: 'Password123!',
    username: 'lucas_dev',
    fullName: 'Lucas Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Full-stack backend engineer specializing in Python and distributed systems. Looking to hone my visual design aesthetics and Figma skills.',
    location: 'Seattle, WA',
    learningMode: 'online',
    teaching: [
      { name: 'Python', level: 'advanced', years: 4, desc: 'Python fundamentals, data structures, automation scripts, and REST APIs with FastAPI.' },
      { name: 'Node.js & Express', level: 'expert', years: 5, desc: 'Node.js event loop, asynchronous architecture, Express, and microservice designs.' },
    ],
    wanted: [
      { name: 'Graphic Design with Photoshop', level: 'intermediate', priority: 'high', notes: 'Want to design my own product hero graphics and social assets.' },
      { name: 'UI/UX Design in Figma', level: 'beginner', priority: 'medium', notes: 'Learn proper spacing and typographic hierarchy in Figma.' },
    ],
    interests: ['Creative Coding', 'Artificial Intelligence', 'UI Design Systems'],
    availability: [
      { day: 1, start: '18:00', end: '21:00' }, // Mon (overlaps with Maya)
      { day: 3, start: '18:00', end: '21:00' }, // Wed (overlaps with Maya)
      { day: 6, start: '11:00', end: '15:00' }, // Sat (overlaps with Maya)
    ],
  },
  {
    email: 'julian.hayes.music@gmail.com',
    password: 'Password123!',
    username: 'julian_music',
    fullName: 'Julian Hayes',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    bio: 'Acoustic guitarist and composer. Teaching fingerpicking styles, open tunings, and vocal harmonies. Wanting to learn modern React web apps.',
    location: 'Austin, TX',
    learningMode: 'online',
    teaching: [
      { name: 'Acoustic Guitar', level: 'intermediate', years: 3.5, desc: 'Fingerpicking technique, open chord voicings, rhythm strumming, and songwriting.' },
      { name: 'Vocal Training', level: 'intermediate', years: 2.5, desc: 'Vocal warmth exercises, pitch control, and harmonization.' },
    ],
    wanted: [
      { name: 'React.js', level: 'beginner', priority: 'high', notes: 'Building a portfolio site for my band and interactive music player.' },
      { name: 'JavaScript', level: 'intermediate', priority: 'medium', notes: 'Understand ES6 promises and web audio API.' },
    ],
    interests: ['Film Photography', 'Sound Synthesis', 'Jazz Harmony'],
    availability: [
      { day: 2, start: '19:00', end: '21:00' },
      { day: 4, start: '19:00', end: '21:00' },
      { day: 0, start: '10:00', end: '14:00' },
    ],
  },
  {
    email: 'elena.rostova.baker@gmail.com',
    password: 'Password123!',
    username: 'elena_culinary',
    fullName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    bio: 'Wild yeast baker & ceramics hobbyist. I teach long fermentation sourdoughs and decorative scoring. Yearning to become conversational in Spanish!',
    location: 'Portland, OR',
    learningMode: 'flexible',
    teaching: [
      { name: 'Artisan Bread Baking', level: 'advanced', years: 4, desc: 'High-hydration wild yeast sourdough, starter maintenance, and decorative lame scoring.' },
    ],
    wanted: [
      { name: 'Conversational Spanish', level: 'beginner', priority: 'high', notes: 'Planning a trip to Oaxaca and want to converse comfortably at local bakeries.' },
    ],
    interests: ['Urban Gardening', 'Ceramic Glazing', 'Fermentation'],
    availability: [
      { day: 5, start: '18:00', end: '21:00' },
      { day: 6, start: '09:00', end: '13:00' },
    ],
  },
  {
    email: 'sofia.ortiz.lang@gmail.com',
    password: 'Password123!',
    username: 'sofia_languages',
    fullName: 'Sofia Ortiz',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    bio: 'Native Spanish speaker & linguist. Passionate about conversational idioms and cultural context. Dream of mastering sourdough bread baking.',
    location: 'Madrid / Remote',
    learningMode: 'online',
    teaching: [
      { name: 'Conversational Spanish', level: 'expert', years: 8, desc: 'Native Spanish, conversational idioms, dialect nuances, and practical dialogue.' },
      { name: 'Conversational French', level: 'advanced', years: 4, desc: 'French grammar, pronunciation, and cafe conversations.' },
    ],
    wanted: [
      { name: 'Artisan Bread Baking', level: 'beginner', priority: 'high', notes: 'Dreaming of baking artisan sourdough loaves with a crackling blistered crust!' },
      { name: 'Piano & Keyboard', level: 'beginner', priority: 'low', notes: 'Learn classic pieces and chord accompaniment.' },
    ],
    interests: ['World Languages', 'Urban Gardening', 'Philosophy & Ethics'],
    availability: [
      { day: 5, start: '17:00', end: '21:00' }, // overlaps with Elena
      { day: 6, start: '10:00', end: '14:00' }, // overlaps with Elena
    ],
  },
  {
    email: 'marcus.vance.seo@gmail.com',
    password: 'Password123!',
    username: 'marcus_marketing',
    fullName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    bio: 'Growth marketer and SEO strategist. Teaching keyword intent, organic funnels, and copywriting. Looking to get comfortable with Docker & SQL.',
    location: 'Chicago, IL',
    learningMode: 'online',
    teaching: [
      { name: 'Search Engine Optimization (SEO)', level: 'expert', years: 6, desc: 'Technical SEO audits, search intent clustering, backlink strategies, and organic funnels.' },
      { name: 'Content Marketing & Copywriting', level: 'advanced', years: 4, desc: 'High-converting landing page copy, value proposition design, and storytelling.' },
    ],
    wanted: [
      { name: 'Docker & Containers', level: 'beginner', priority: 'high', notes: 'Containerize internal marketing tools and self-hosted apps.' },
      { name: 'PostgreSQL & SQL', level: 'intermediate', priority: 'medium', notes: 'Write analytical SQL queries directly against production databases.' },
    ],
    interests: ['Artificial Intelligence', 'Digital Marketing'],
    availability: [
      { day: 1, start: '18:00', end: '20:00' },
      { day: 4, start: '18:00', end: '20:00' },
    ],
  },
  {
    email: 'aria.chen.3d@gmail.com',
    password: 'Password123!',
    username: 'aria_blender',
    fullName: 'Aria Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    bio: '3D motion artist and Blender enthusiast. Lighting, geometry nodes, and sculpting. Excited to learn Python automation and music production.',
    location: 'Vancouver, BC',
    learningMode: 'flexible',
    teaching: [
      { name: '3D Modeling with Blender', level: 'advanced', years: 3.5, desc: 'Hard-surface 3D modeling, lighting setups, procedural materials, and animation loops.' },
    ],
    wanted: [
      { name: 'Python', level: 'intermediate', priority: 'high', notes: 'Write Blender Python scripts for procedural asset generation.' },
      { name: 'Music Production in Ableton', level: 'beginner', priority: 'medium', notes: 'Create ambient background soundscapes for 3D render reels.' },
    ],
    interests: ['Creative Coding', 'Indie Game Dev', 'Sound Synthesis'],
    availability: [
      { day: 3, start: '18:00', end: '21:00' },
      { day: 6, start: '12:00', end: '16:00' },
    ],
  },
  {
    email: 'chloe.dubois.yoga@gmail.com',
    password: 'Password123!',
    username: 'chloe_yoga',
    fullName: 'Chloe Dubois',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    bio: 'Certified yoga teacher and wellness guide. Focus on breathwork, alignment, and mindfulness. Love learning culinary arts and acoustic guitar.',
    location: 'Montreal, QC',
    learningMode: 'flexible',
    teaching: [
      { name: 'Vinyasa Yoga', level: 'expert', years: 7, desc: 'Vinyasa flow, mindful breathwork (pranayama), mobility, and postural alignment.' },
    ],
    wanted: [
      { name: 'Artisan Bread Baking', level: 'beginner', priority: 'medium', notes: 'Mindful sourdough bread baking as a weekly meditative ritual.' },
      { name: 'Acoustic Guitar', level: 'beginner', priority: 'low', notes: 'Acoustic guitar basics for relaxation sessions.' },
    ],
    interests: ['Yoga & Mindfulness', 'Urban Gardening'],
    availability: [
      { day: 2, start: '07:00', end: '09:00' },
      { day: 0, start: '09:00', end: '12:00' },
    ],
  },
];

async function seedUser(account, skillMap) {
  const client = createClient(supabaseUrl, supabaseKey);

  // 1. Try sign in first, or sign up
  let session = null;
  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });

  if (signInData?.session) {
    session = signInData.session;
  } else {
    const { data: signUpData, error: signUpErr } = await client.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: {
          full_name: account.fullName,
          username: account.username,
        },
      },
    });

    if (signUpErr) {
      console.warn(`SignUp warning for ${account.username}:`, signUpErr.message);
      return null;
    }
    session = signUpData.session;
  }

  if (!session?.user?.id) {
    console.error(`Could not obtain session for ${account.username}`);
    return null;
  }

  const userId = session.user.id;
  const userClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
  });

  // 2. Update Profile
  await userClient
    .from('profiles')
    .update({
      full_name: account.fullName,
      username: account.username,
      avatar_url: account.avatarUrl,
      bio: account.bio,
      location: account.location,
      preferred_learning_mode: account.learningMode,
      onboarding_completed: true,
      rating_avg: 4.95,
      rating_count: 20,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // 3. Clear existing user records
  await Promise.all([
    userClient.from('user_skills').delete().eq('user_id', userId),
    userClient.from('wanted_skills').delete().eq('user_id', userId),
    userClient.from('user_interests').delete().eq('user_id', userId),
    userClient.from('availability').delete().eq('user_id', userId),
  ]);

  // 4. Insert Teaching Skills
  for (const t of account.teaching) {
    const skillId = skillMap[t.name.toLowerCase()];
    if (skillId) {
      await userClient.from('user_skills').insert({
        user_id: userId,
        skill_id: skillId,
        proficiency_level: t.level,
        experience_years: t.years,
        description: t.desc,
        is_active: true,
      });
    }
  }

  // 5. Insert Wanted Skills
  for (const w of account.wanted) {
    const skillId = skillMap[w.name.toLowerCase()];
    if (skillId) {
      await userClient.from('wanted_skills').insert({
        user_id: userId,
        skill_id: skillId,
        target_proficiency: w.level,
        priority: w.priority,
        notes: w.notes,
      });
    }
  }

  // 6. Insert Interests
  if (account.interests?.length > 0) {
    const interestRows = account.interests.map((name) => ({ user_id: userId, name }));
    await userClient.from('user_interests').insert(interestRows);
  }

  // 7. Insert Availability
  if (account.availability?.length > 0) {
    const availRows = account.availability.map((a) => ({
      user_id: userId,
      day_of_week: a.day,
      start_time: a.start,
      end_time: a.end,
      time_zone: 'UTC',
      is_active: true,
    }));
    await userClient.from('availability').insert(availRows);
  }

  console.log(`✅ Seeded: ${account.fullName} (@${account.username}) [${userId}]`);
  return { id: userId, username: account.username };
}

async function run() {
  console.log('🚀 Authenticating and seeding 8 real accounts into Supabase...');

  const rootClient = createClient(supabaseUrl, supabaseKey);
  const { data: skills } = await rootClient.from('skills').select('id, name');
  const skillMap = {};
  skills?.forEach((s) => {
    skillMap[s.name.toLowerCase()] = s.id;
  });

  const seeded = [];
  for (const acc of ACCOUNTS) {
    try {
      const res = await seedUser(acc, skillMap);
      if (res) seeded.push(res);
    } catch (err) {
      console.error(`Error seeding ${acc.username}:`, err.message);
    }
  }

  console.log(`\n🎉 Completed! Successfully seeded ${seeded.length} authentic accounts into Supabase PostgreSQL.`);
}

run();
