import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { createNotification } from './notificationService.js';

const client = supabaseAdmin || supabase;

/**
 * 1. Schedule a Learning Session
 */
export async function createSession({
  swapRequestId,
  teacherId,
  learnerId,
  skillId,
  title,
  description = '',
  scheduledStart,
  scheduledEnd,
  meetingLink,
  scheduledByUserId,
}) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  if (!teacherId || !learnerId) {
    throw new Error('Teacher and learner are required to schedule a session.');
  }

  if (teacherId === learnerId) {
    throw new Error('Teacher and learner cannot be the same person.');
  }

  if (!scheduledStart || !scheduledEnd) {
    throw new Error('Start time and end time are required.');
  }

  const start = new Date(scheduledStart);
  const end = new Date(scheduledEnd);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date/time format provided.');
  }

  if (start >= end) {
    throw new Error('Scheduled start time must be before end time.');
  }

  // Generate meeting link if not supplied
  const roomHash = Math.random().toString(36).substring(2, 9);
  const finalMeetingLink =
    meetingLink && meetingLink.trim()
      ? meetingLink.trim()
      : `https://meet.jit.si/skillswap-${roomHash}`;

  // If skillId not given, look up from swap request
  let finalSkillId = skillId;
  if (!finalSkillId && swapRequestId) {
    const { data: swap } = await client
      .from('swap_requests')
      .select('offered_skill_id, requested_skill_id, sender_id')
      .eq('id', swapRequestId)
      .single();

    if (swap) {
      finalSkillId =
        swap.sender_id === teacherId ? swap.offered_skill_id : swap.requested_skill_id;
    }
  }

  if (!finalSkillId) {
    throw new Error('Skill selection is required for this session.');
  }

  const finalTitle = title && title.trim() ? title.trim() : 'SkillSwap Learning Session';

  const { data: session, error } = await client
    .from('sessions')
    .insert({
      swap_request_id: swapRequestId,
      teacher_id: teacherId,
      learner_id: learnerId,
      skill_id: finalSkillId,
      title: finalTitle,
      description: description.trim(),
      meeting_link: finalMeetingLink,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      status: 'scheduled',
    })
    .select(`
      *,
      teacher:teacher_id (id, full_name, username, avatar_url),
      learner:learner_id (id, full_name, username, avatar_url),
      skill:skill_id (id, name, slug)
    `)
    .single();

  if (error) throw error;

  // Notify the other participant
  const otherUserId = scheduledByUserId === teacherId ? learnerId : teacherId;
  const schedulerRole = scheduledByUserId === teacherId ? 'teacher' : 'learner';
  const formattedTime = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  await createNotification({
    userId: otherUserId,
    type: 'session_scheduled',
    title: 'New Session Scheduled! 📅',
    body: `A new session for ${session.skill?.name} has been set for ${formattedTime}.`,
    actionUrl: '/exchanges?tab=sessions',
  });

  return session;
}

/**
 * 2. Get User Sessions (Upcoming & Completed)
 */
export async function getUserSessions(userId) {
  if (!isSupabaseConfigured() || !userId) {
    return { upcoming: [], completed: [], cancelled: [] };
  }

  const { data: sessions, error } = await client
    .from('sessions')
    .select(`
      id,
      swap_request_id,
      teacher_id,
      learner_id,
      skill_id,
      title,
      description,
      meeting_link,
      scheduled_start,
      scheduled_end,
      status,
      created_at,
      teacher:teacher_id (id, full_name, username, avatar_url, location),
      learner:learner_id (id, full_name, username, avatar_url, location),
      skill:skill_id (id, name, slug, description),
      reviews (id, rating, comment, reviewer_id)
    `)
    .or(`teacher_id.eq.${userId},learner_id.eq.${userId}`)
    .order('scheduled_start', { ascending: true });

  if (error) throw error;

  const now = new Date();
  const upcoming = [];
  const completed = [];
  const cancelled = [];

  (sessions || []).forEach((sess) => {
    if (sess.status === 'cancelled') {
      cancelled.push(sess);
    } else if (sess.status === 'completed' || new Date(sess.scheduled_end) < now) {
      completed.push(sess);
    } else {
      upcoming.push(sess);
    }
  });

  // Sort completed descending (most recent first)
  completed.sort((a, b) => new Date(b.scheduled_start) - new Date(a.scheduled_start));

  return {
    upcoming,
    completed,
    cancelled,
  };
}

/**
 * 3. Reschedule / Update Session
 */
export async function updateSession({
  sessionId,
  userId,
  scheduledStart,
  scheduledEnd,
  title,
  meetingLink,
  description,
}) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  // Verify membership
  const { data: existing, error: fetchErr } = await client
    .from('sessions')
    .select('*, skill:skill_id (name)')
    .eq('id', sessionId)
    .single();

  if (fetchErr || !existing) throw new Error('Session not found.');

  if (existing.teacher_id !== userId && existing.learner_id !== userId) {
    throw new Error('Only participating teacher or learner can modify this session.');
  }

  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (title) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (meetingLink) updates.meeting_link = meetingLink.trim();

  if (scheduledStart && scheduledEnd) {
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    if (start >= end) throw new Error('Start time must be before end time.');
    updates.scheduled_start = start.toISOString();
    updates.scheduled_end = end.toISOString();
  }

  const { data: updated, error: updateErr } = await client
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select(`
      *,
      teacher:teacher_id (id, full_name, username, avatar_url),
      learner:learner_id (id, full_name, username, avatar_url),
      skill:skill_id (id, name, slug)
    `)
    .single();

  if (updateErr) throw updateErr;

  // Notify other participant
  const otherUserId = existing.teacher_id === userId ? existing.learner_id : existing.teacher_id;
  await createNotification({
    userId: otherUserId,
    type: 'session_scheduled',
    title: 'Session Rescheduled 🕒',
    body: `The session for ${existing.skill?.name} has been updated. Check the new time in your schedule.`,
    actionUrl: '/exchanges?tab=sessions',
  });

  return updated;
}

/**
 * 4. Mark Session as Completed
 */
export async function completeSession({ sessionId, userId }) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  const { data: existing, error: fetchErr } = await client
    .from('sessions')
    .select('*, skill:skill_id (name)')
    .eq('id', sessionId)
    .single();

  if (fetchErr || !existing) throw new Error('Session not found.');

  if (existing.teacher_id !== userId && existing.learner_id !== userId) {
    throw new Error('Only participating members can mark this session as completed.');
  }

  const { data: updated, error: updateErr } = await client
    .from('sessions')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select(`
      *,
      teacher:teacher_id (id, full_name, username, avatar_url),
      learner:learner_id (id, full_name, username, avatar_url),
      skill:skill_id (id, name, slug)
    `)
    .single();

  if (updateErr) throw updateErr;

  // If this session has a swap request, also update swap request status to completed
  if (existing.swap_request_id) {
    await client
      .from('swap_requests')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', existing.swap_request_id);
  }

  // Notify both users to write reviews
  const otherUserId = existing.teacher_id === userId ? existing.learner_id : existing.teacher_id;
  await createNotification({
    userId: otherUserId,
    type: 'session_reminder',
    title: 'Session Completed! ⭐',
    body: `Your session for ${existing.skill?.name} was completed. Don't forget to leave a review!`,
    actionUrl: `/profile/${userId}`,
  });

  return updated;
}

/**
 * 5. Cancel Session
 */
export async function cancelSession({ sessionId, userId, reason = '' }) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  const { data: existing, error: fetchErr } = await client
    .from('sessions')
    .select('*, skill:skill_id (name)')
    .eq('id', sessionId)
    .single();

  if (fetchErr || !existing) throw new Error('Session not found.');

  if (existing.teacher_id !== userId && existing.learner_id !== userId) {
    throw new Error('Only participants can cancel this session.');
  }

  const { data: updated, error: updateErr } = await client
    .from('sessions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  const otherUserId = existing.teacher_id === userId ? existing.learner_id : existing.teacher_id;
  await createNotification({
    userId: otherUserId,
    type: 'system',
    title: 'Session Cancelled ⚠️',
    body: `The scheduled session for ${existing.skill?.name} was cancelled.`,
    actionUrl: '/exchanges?tab=sessions',
  });

  return updated;
}
