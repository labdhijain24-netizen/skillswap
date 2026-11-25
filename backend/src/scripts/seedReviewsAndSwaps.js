import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

async function seedSwapsAndReviews() {
  const client = createClient(supabaseUrl, supabaseKey);

  // Sign in as Maya to get Maya's ID
  const { data: mayaAuth } = await client.auth.signInWithPassword({
    email: 'maya.lin.design@gmail.com',
    password: 'Password123!',
  });

  const { data: lucasAuth } = await client.auth.signInWithPassword({
    email: 'lucas.vance.dev@gmail.com',
    password: 'Password123!',
  });

  if (!mayaAuth?.user || !lucasAuth?.user) {
    console.log('Maya or Lucas auth failed');
    return;
  }

  const mayaId = mayaAuth.user.id;
  const lucasId = lucasAuth.user.id;

  const mayaClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${mayaAuth.session.access_token}` } },
  });

  const lucasClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${lucasAuth.session.access_token}` } },
  });

  // Get skill IDs
  const { data: skills } = await client.from('skills').select('id, name');
  const pythonId = skills?.find((s) => s.name === 'Python')?.id;
  const photoshopId = skills?.find((s) => s.name.includes('Photoshop'))?.id;

  // Maya proposes to Lucas: Maya offers Photoshop, requests Python
  const { data: swap, error: swapErr } = await mayaClient
    .from('swap_requests')
    .insert({
      sender_id: mayaId,
      receiver_id: lucasId,
      offered_skill_id: photoshopId,
      requested_skill_id: pythonId,
      status: 'completed',
      message: 'Hey Lucas! Would love to swap Photoshop branding for Python scripts!',
      responded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (swapErr) {
    console.log('Swap insert note:', swapErr.message);
  } else {
    console.log('✅ Completed swap request created:', swap.id);

    // Create completed session
    const { data: sess, error: sessErr } = await mayaClient
      .from('sessions')
      .insert({
        swap_request_id: swap.id,
        teacher_id: lucasId,
        learner_id: mayaId,
        skill_id: pythonId,
        title: 'Python Scripting Deep Dive',
        description: 'Automating SVG asset pipelines',
        scheduled_start: new Date(Date.now() - 5 * 86400000).toISOString(),
        scheduled_end: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
        status: 'completed',
      })
      .select()
      .single();

    if (!sessErr && sess) {
      console.log('✅ Completed session created:', sess.id);

      // Maya reviews Lucas
      const { error: revErr1 } = await mayaClient.from('reviews').insert({
        session_id: sess.id,
        reviewer_id: mayaId,
        reviewee_id: lucasId,
        rating: 5,
        comment: 'Lucas is a phenomenal engineer! Clear, patient, and made Python click right away.',
      });
      if (!revErr1) console.log('✅ Maya reviewed Lucas (5 stars)');

      // Lucas reviews Maya
      const { error: revErr2 } = await lucasClient.from('reviews').insert({
        session_id: sess.id,
        reviewer_id: lucasId,
        reviewee_id: mayaId,
        rating: 5,
        comment: 'Maya is a design genius. She completely elevated our startup brand aesthetic in one session.',
      });
      if (!revErr2) console.log('✅ Lucas reviewed Maya (5 stars)');
    }
  }
}

seedSwapsAndReviews().catch(console.error);
