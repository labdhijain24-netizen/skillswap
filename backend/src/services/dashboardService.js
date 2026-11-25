import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { getMatchesForUser } from './matchService.js';

const client = supabaseAdmin || supabase;

/**
 * Dashboard Service — Aggregates all authenticated user data
 * for the personalized SkillSwap dashboard.
 */

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(profile, teachingSkills, wantedSkills, interests, availability) {
  const checks = [
    { label: 'Full Name', done: Boolean(profile?.full_name) },
    { label: 'Username', done: Boolean(profile?.username) },
    { label: 'Avatar', done: Boolean(profile?.avatar_url) },
    { label: 'Bio', done: Boolean(profile?.bio && profile.bio.length > 10) },
    { label: 'Location', done: Boolean(profile?.location) },
    { label: 'Learning Mode', done: Boolean(profile?.preferred_learning_mode) },
    { label: 'At Least 1 Teaching Skill', done: teachingSkills.length > 0 },
    { label: 'At Least 1 Wanted Skill', done: wantedSkills.length > 0 },
    { label: 'Interests', done: interests.length >= 2 },
    { label: 'Availability Set', done: availability.length > 0 },
  ];

  const completed = checks.filter((c) => c.done).length;
  const total = checks.length;
  const percentage = Math.round((completed / total) * 100);

  return { percentage, completed, total, checks };
}

/**
 * Get full dashboard data for authenticated user
 */
export async function getDashboardData(userId) {
  if (!isSupabaseConfigured() || !userId) {
    return { error: 'Not configured or no user ID' };
  }

  // Fire all queries in parallel
  const [
    profileRes,
    teachingRes,
    wantedRes,
    interestsRes,
    availabilityRes,
    incomingRequestsRes,
    outgoingRequestsRes,
    matchesRes,
    sessionsRes,
    reviewsReceivedRes,
    reviewsGivenRes,
    notificationsRes,
    conversationsRes,
  ] = await Promise.all([
    // 1. Profile
    client.from('profiles').select('*').eq('id', userId).single(),

    // 2. Teaching skills
    client
      .from('user_skills')
      .select('id, skill_id, proficiency_level, experience_years, skills (id, name, slug, skill_categories (name, icon))')
      .eq('user_id', userId)
      .eq('is_active', true),

    // 3. Wanted skills
    client
      .from('wanted_skills')
      .select('id, skill_id, target_proficiency, priority, skills (id, name, slug, skill_categories (name, icon))')
      .eq('user_id', userId),

    // 4. Interests
    client.from('user_interests').select('id, name').eq('user_id', userId),

    // 5. Availability
    client
      .from('availability')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('day_of_week'),

    // 6. Incoming swap requests
    client
      .from('swap_requests')
      .select(`
        id, status, message, created_at,
        sender:sender_id (id, full_name, username, avatar_url),
        offered_skill:offered_skill_id (id, name),
        requested_skill:requested_skill_id (id, name)
      `)
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),

    // 7. Outgoing swap requests
    client
      .from('swap_requests')
      .select(`
        id, status, message, created_at,
        receiver:receiver_id (id, full_name, username, avatar_url),
        offered_skill:offered_skill_id (id, name),
        requested_skill:requested_skill_id (id, name)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),

    // 8. Active matches
    client
      .from('matches')
      .select(`
        id, compatibility_score, created_at,
        user_a:user_a_id (id, full_name, username, avatar_url, rating_avg),
        user_b:user_b_id (id, full_name, username, avatar_url, rating_avg),
        skill_a:user_a_skill_id (id, name),
        skill_b:user_b_skill_id (id, name)
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10),

    // 9. Sessions (all types)
    client
      .from('sessions')
      .select(`
        id, title, status, scheduled_start, scheduled_end, meeting_link, created_at,
        teacher:teacher_id (id, full_name, username, avatar_url),
        learner:learner_id (id, full_name, username, avatar_url),
        skill:skill_id (id, name)
      `)
      .or(`teacher_id.eq.${userId},learner_id.eq.${userId}`)
      .order('scheduled_start', { ascending: true }),

    // 10. Reviews received
    client
      .from('reviews')
      .select('id, rating, comment, created_at, session_id, reviewer:reviewer_id (id, full_name, username, avatar_url)')
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),

    // 11. Reviews given
    client
      .from('reviews')
      .select('id, rating, comment, created_at, session_id, reviewee:reviewee_id (id, full_name, username, avatar_url)')
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),

    // 12. Notifications (latest 20)
    client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),

    // 13. Conversations (count unread)
    client
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId),
  ]);

  const profile = profileRes.data;
  const teachingSkills = teachingRes.data || [];
  const wantedSkills = wantedRes.data || [];
  const interests = interestsRes.data || [];
  const availability = availabilityRes.data || [];
  const incomingRequests = incomingRequestsRes.data || [];
  const outgoingRequests = outgoingRequestsRes.data || [];
  const matches = matchesRes.data || [];
  const allSessions = sessionsRes.data || [];
  const reviewsReceived = reviewsReceivedRes.data || [];
  const reviewsGiven = reviewsGivenRes.data || [];
  const notifications = notificationsRes.data || [];

  // Compute recommended matches via matching algorithm
  let recommendedMatches = [];
  try {
    recommendedMatches = await getMatchesForUser(userId, { limit: 5 });
  } catch (mErr) {
    console.warn('Dashboard match recommendations note:', mErr.message);
  }

  // Profile completion
  const profileCompletion = calculateProfileCompletion(
    profile, teachingSkills, wantedSkills, interests, availability
  );

  // Categorize sessions
  const now = new Date();
  const upcomingSessions = allSessions.filter(
    (s) => s.status === 'scheduled' && new Date(s.scheduled_start) > now
  );
  const completedSessions = allSessions.filter((s) => s.status === 'completed');
  const cancelledSessions = allSessions.filter((s) => s.status === 'cancelled');

  // Categorize swap requests
  const pendingIncoming = incomingRequests.filter((r) => r.status === 'pending');
  const pendingOutgoing = outgoingRequests.filter((r) => r.status === 'pending');
  const acceptedRequests = [
    ...incomingRequests.filter((r) => r.status === 'accepted'),
    ...outgoingRequests.filter((r) => r.status === 'accepted'),
  ];
  const completedExchanges = [
    ...incomingRequests.filter((r) => r.status === 'completed'),
    ...outgoingRequests.filter((r) => r.status === 'completed'),
  ];

  // Calculate stats
  const avgRating =
    reviewsReceived.length > 0
      ? reviewsReceived.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsReceived.length
      : 0;

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  // Activity summary: count sessions by month for last 6 months
  const activityByMonth = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    activityByMonth[key] = 0;
  }
  completedSessions.forEach((s) => {
    const d = new Date(s.scheduled_start || s.created_at);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (key in activityByMonth) activityByMonth[key]++;
  });

  return {
    profile,
    profileCompletion,
    teachingSkills,
    wantedSkills,
    interests,
    availability,
    requests: {
      incoming: incomingRequests,
      outgoing: outgoingRequests,
      pendingIncoming,
      pendingOutgoing,
      activeExchanges: acceptedRequests,
      completedExchanges,
    },
    matches: recommendedMatches.length > 0 ? recommendedMatches : matches,
    recommendedMatches,
    sessions: {
      upcoming: upcomingSessions,
      completed: completedSessions,
      cancelled: cancelledSessions,
      total: allSessions.length,
    },
    reviews: {
      received: reviewsReceived,
      given: reviewsGiven,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReceived: reviewsReceived.length,
    },
    notifications,
    unreadNotifications,
    stats: {
      totalTeachingSkills: teachingSkills.length,
      totalWantedSkills: wantedSkills.length,
      totalMatches: matches.length,
      totalCompletedSessions: completedSessions.length,
      totalUpcomingSessions: upcomingSessions.length,
      activityByMonth,
    },
  };
}
