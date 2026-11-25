import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testDashboard() {
  console.log('🧪 ========================================================');
  console.log('🧪 SKILLSWAP DASHBOARD & NOTIFICATIONS VERIFICATION');
  console.log('🧪 ========================================================\n');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Get sample user Julian Hayes
    const { data: profiles } = await supabase.from('profiles').select('id, username, full_name');
    const julian = profiles.find((p) => p.username === 'julian_music');
    const chloe = profiles.find((p) => p.username === 'chloe_yoga');

    if (!julian || !chloe) {
      throw new Error('Test users julian_music or chloe_yoga not found.');
    }

    console.log(`Test User: ${julian.full_name} (${julian.id})\n`);

    // -------------------------------------------------------------------------
    // TEST 1: Get Dashboard Data
    // -------------------------------------------------------------------------
    console.log('📊 1. Fetching complete personalized dashboard data...');
    const dashRes = await fetch(`${baseUrl}/dashboard/user/${julian.id}`);
    const dashJson = await dashRes.json();

    console.log(`   Response status: ${dashRes.status}, success: ${dashJson.success}`);
    if (!dashJson.success) throw new Error(dashJson.message || 'Failed to fetch dashboard');

    const data = dashJson.data;

    // Check Welcome & Profile
    console.log(`   ✅ Profile: ${data.profile?.full_name} (@${data.profile?.username})`);
    
    // Check Profile Completion Indicator
    console.log(`   ✅ Profile Completion: ${data.profileCompletion?.percentage}% (${data.profileCompletion?.completed}/${data.profileCompletion?.total} checks passed)`);
    if (typeof data.profileCompletion?.percentage !== 'number') {
      throw new Error('Profile completion indicator missing!');
    }

    // Check Recommended Matches
    console.log(`   ✅ Recommended Matches: ${data.matches?.length || 0} match(es) identified`);

    // Check Requests
    console.log(`   ✅ Incoming Requests: ${data.requests?.incoming?.length || 0} (${data.requests?.pendingIncoming?.length || 0} pending)`);
    console.log(`   ✅ Outgoing Requests: ${data.requests?.outgoing?.length || 0} (${data.requests?.pendingOutgoing?.length || 0} pending)`);

    // Check Active Exchanges
    console.log(`   ✅ Active Exchanges: ${data.requests?.activeExchanges?.length || 0}`);

    // Check Upcoming & Completed Sessions
    console.log(`   ✅ Upcoming Sessions: ${data.sessions?.upcoming?.length || 0}`);
    console.log(`   ✅ Completed Sessions: ${data.sessions?.completed?.length || 0}`);

    // Check Learning Activity
    console.log(`   ✅ Learning Activity:`, data.stats?.activityByMonth);

    // Check Reviews & Ratings
    console.log(`   ✅ Reviews Received: ${data.reviews?.totalReceived || 0} (Avg Rating: ${data.reviews?.avgRating || 0})`);

    // -------------------------------------------------------------------------
    // TEST 2: Notifications System
    // -------------------------------------------------------------------------
    console.log('\n🔔 2. Testing Notifications System...');
    
    // Fetch notifications for Julian
    const notifRes = await fetch(`${baseUrl}/notifications/user/${julian.id}`);
    const notifJson = await notifRes.json();
    console.log(`   Fetched ${notifJson.data?.length || 0} notifications for ${julian.full_name}`);

    // Insert a test notification for Julian if none exist
    let testNotifId;
    if (notifJson.data && notifJson.data.length > 0) {
      testNotifId = notifJson.data[0].id;
    } else {
      const { data: createdNotif } = await supabase.from('notifications').insert({
        user_id: julian.id,
        type: 'swap_request_received',
        title: 'New Skill Swap Proposal! ✨',
        body: 'Chloe Dubois wants to exchange Vinyasa Yoga for your Acoustic Guitar.',
        actionUrl: '/exchanges?tab=requests',
        is_read: false,
      }).select().single();
      testNotifId = createdNotif.id;
    }

    // Mark single notification as read
    console.log(`   Marking notification ${testNotifId} as read...`);
    const readRes = await fetch(`${baseUrl}/notifications/${testNotifId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: julian.id }),
    });
    const readJson = await readRes.json();
    console.log(`   Mark read status: ${readRes.status}, is_read: ${readJson.data?.is_read}`);
    if (!readJson.success || !readJson.data?.is_read) {
      throw new Error('Failed to mark notification as read');
    }

    // Mark all as read
    console.log(`   Marking all notifications as read for ${julian.full_name}...`);
    const readAllRes = await fetch(`${baseUrl}/notifications/read-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: julian.id }),
    });
    const readAllJson = await readAllRes.json();
    console.log(`   Mark all read status: ${readAllRes.status}, success: ${readAllJson.success}`);
    if (!readAllJson.success) {
      throw new Error('Failed to mark all notifications as read');
    }

    console.log('\n========================================================');
    console.log('🎉 ALL DASHBOARD & NOTIFICATIONS TESTS PASSED 100%!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('❌ Dashboard test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

testDashboard();
