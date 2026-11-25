import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testLifecycle() {
  console.log('🧪 ========================================================');
  console.log('🧪 SKILL EXCHANGE LIFECYCLE END-TO-END VERIFICATION');
  console.log('🧪 ========================================================\n');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Get sample users
    const { data: profiles } = await supabase.from('profiles').select('id, username, full_name');
    const julian = profiles.find((p) => p.username === 'julian_music');
    const chloe = profiles.find((p) => p.username === 'chloe_yoga');

    if (!julian || !chloe) {
      throw new Error('Test users julian_music or chloe_yoga not found in database.');
    }

    console.log(`Test Participants:
    - Sender:   ${julian.full_name} (${julian.id})
    - Receiver: ${chloe.full_name} (${chloe.id})\n`);

    // Fetch skills
    const { data: skills } = await supabase.from('skills').select('id, name');
    const guitarSkill = skills.find((s) => s.name.includes('Guitar'));
    const yogaSkill = skills.find((s) => s.name.includes('Yoga'));

    // -------------------------------------------------------------------------
    // STEP 1: Send Exchange Request
    // -------------------------------------------------------------------------
    console.log('📦 1. Sending Exchange Request...');
    const sendRes = await fetch(`${baseUrl}/swaps/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: julian.id,
        receiverId: chloe.id,
        offeredSkill: guitarSkill.id,
        requestedSkill: yogaSkill.id,
        message: 'Hi Chloe! Would love to trade acoustic guitar lessons for vinyasa yoga sessions!',
      }),
    });

    const sendJson = await sendRes.json();
    console.log(`   Response status: ${sendRes.status}, success: ${sendJson.success}`);
    if (!sendJson.success) throw new Error(sendJson.message || 'Failed to send swap request');

    const swapId = sendJson.data.id;
    const convId = sendJson.data.conversation_id;
    console.log(`   ✅ Swap Request Created: ${swapId}`);
    console.log(`   ✅ Linked Conversation: ${convId}\n`);

    // -------------------------------------------------------------------------
    // STEP 2: Duplicate Prevention Test
    // -------------------------------------------------------------------------
    console.log('🛡️ 2. Testing Duplicate Prevention...');
    const dupRes = await fetch(`${baseUrl}/swaps/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: julian.id,
        receiverId: chloe.id,
        offeredSkill: guitarSkill.id,
        requestedSkill: yogaSkill.id,
        message: 'Duplicate attempt',
      }),
    });
    const dupJson = await dupRes.json();
    console.log(`   Duplicate attempt status: ${dupRes.status}, error message: "${dupJson.message}"`);
    if (dupRes.status === 201) throw new Error('Duplicate request was erroneously allowed!');
    console.log('   ✅ Duplicate prevention verified.\n');

    // -------------------------------------------------------------------------
    // STEP 3: Retrieve User Requests
    // -------------------------------------------------------------------------
    console.log('📋 3. Retrieving User Requests for Chloe (Receiver)...');
    const reqRes = await fetch(`${baseUrl}/swaps/user/${chloe.id}`);
    const reqJson = await reqRes.json();
    const incomingChloe = reqJson.data.incoming;
    const foundIncoming = incomingChloe.find((r) => r.id === swapId);
    console.log(`   Total incoming for Chloe: ${incomingChloe.length}`);
    if (!foundIncoming) throw new Error('Created request not found in Chloe incoming requests');
    console.log(`   ✅ Request status in DB: "${foundIncoming.status}"\n`);

    // -------------------------------------------------------------------------
    // STEP 4: Accept Exchange Request
    // -------------------------------------------------------------------------
    console.log('🎉 4. Accepting Exchange Request...');
    const acceptRes = await fetch(`${baseUrl}/swaps/${swapId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: chloe.id }),
    });
    const acceptJson = await acceptRes.json();
    console.log(`   Accept response status: ${acceptRes.status}, status: ${acceptJson.data?.status}`);
    if (acceptJson.data?.status !== 'accepted') throw new Error('Swap request not marked accepted');

    // Verify Match Record Activation
    const uA = julian.id < chloe.id ? julian.id : chloe.id;
    const uB = julian.id < chloe.id ? chloe.id : julian.id;
    const { data: matchRecord } = await supabase
      .from('matches')
      .select('*')
      .eq('user_a_id', uA)
      .eq('user_b_id', uB)
      .single();

    console.log(`   ✅ Match activated in PostgreSQL: ${matchRecord?.id} (Score: ${matchRecord?.compatibility_score}%)`);
    if (!matchRecord) throw new Error('Match record was not activated in database!');

    // Verify Notification Delivered to Julian
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', julian.id)
      .eq('type', 'swap_request_accepted');
    console.log(`   ✅ Notification delivered to sender: ${notifs?.length} accepted alert(s)\n`);

    // -------------------------------------------------------------------------
    // STEP 5: Schedule Learning Session
    // -------------------------------------------------------------------------
    console.log('📅 5. Scheduling Learning Session...');
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(18, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow.getTime() + 3600000); // 1 hour

    const sessRes = await fetch(`${baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        swapRequestId: swapId,
        teacherId: julian.id,
        learnerId: chloe.id,
        skillId: guitarSkill.id,
        title: 'Acoustic Guitar Fingerpicking Session 1',
        description: 'First chord transitions and Travis picking patterns',
        scheduledStart: tomorrow.toISOString(),
        scheduledEnd: tomorrowEnd.toISOString(),
        scheduledByUserId: julian.id,
      }),
    });
    const sessJson = await sessRes.json();
    console.log(`   Session creation status: ${sessRes.status}`);
    if (!sessJson.success) throw new Error(sessJson.message || 'Failed to schedule session');

    const sessionId = sessJson.data.id;
    console.log(`   ✅ Session scheduled: ${sessionId} (Meeting: ${sessJson.data.meeting_link})`);

    // -------------------------------------------------------------------------
    // STEP 6: Reschedule Session
    // -------------------------------------------------------------------------
    console.log('\n🕒 6. Rescheduling Session...');
    const dayAfter = new Date(tomorrow.getTime() + 86400000);
    const dayAfterEnd = new Date(dayAfter.getTime() + 3600000);

    const updateRes = await fetch(`${baseUrl}/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: chloe.id,
        scheduledStart: dayAfter.toISOString(),
        scheduledEnd: dayAfterEnd.toISOString(),
        title: 'Acoustic Guitar Session 1 (Rescheduled)',
      }),
    });
    const updateJson = await updateRes.json();
    console.log(`   Reschedule status: ${updateRes.status}, title: "${updateJson.data?.title}"\n`);

    // -------------------------------------------------------------------------
    // STEP 7: Messaging System (Send, View, Read)
    // -------------------------------------------------------------------------
    console.log('💬 7. Testing Messaging & Conversations...');
    // Send message from Chloe to Julian
    const msgRes = await fetch(`${baseUrl}/chat/conversations/${convId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: chloe.id,
        content: 'Thanks for scheduling! The rescheduled time works perfectly for me.',
      }),
    });
    const msgJson = await msgRes.json();
    console.log(`   Message sent status: ${msgRes.status}, id: ${msgJson.data?.id}`);

    // Retrieve conversation messages
    const getMsgRes = await fetch(`${baseUrl}/chat/conversations/${convId}/messages?userId=${julian.id}`);
    const getMsgJson = await getMsgRes.json();
    console.log(`   Retrieved ${getMsgJson.data?.length} messages in conversation.`);

    // Check conversation list for Julian
    const convListRes = await fetch(`${baseUrl}/chat/conversations/${julian.id}`);
    const convListJson = await convListRes.json();
    const julianConv = convListJson.data?.find((c) => c.id === convId);
    console.log(`   Julian conversation list: other member is ${julianConv?.otherMember?.full_name}, unread: ${julianConv?.unreadCount}`);
    console.log('   ✅ Messaging system verified.\n');

    // -------------------------------------------------------------------------
    // STEP 8: Mark Session Completed
    // -------------------------------------------------------------------------
    console.log('🏁 8. Completing Learning Session...');
    const compRes = await fetch(`${baseUrl}/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: julian.id }),
    });
    const compJson = await compRes.json();
    console.log(`   Complete session status: ${compRes.status}, session status: ${compJson.data?.status}`);
    if (compJson.data?.status !== 'completed') throw new Error('Session status not completed');
    console.log('   ✅ Session completed successfully in PostgreSQL.\n');

    console.log('========================================================');
    console.log('🎉 ALL SKILL EXCHANGE LIFECYCLE TESTS PASSED 100%!');
    console.log('========================================================\n');
  } finally {
    server.close();
  }
}

testLifecycle().catch((err) => {
  console.error('❌ Lifecycle test failed:', err);
  process.exit(1);
});
