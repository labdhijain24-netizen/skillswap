import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { createNotification } from './notificationService.js';

const client = supabaseAdmin || supabase;

/**
 * 1. Submit a Review for a Completed Session
 */
export async function createReview({ sessionId, reviewerId, rating, comment = '' }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase database is not configured');
  }

  if (!sessionId || !reviewerId) {
    throw new Error('Session ID and Reviewer ID are required.');
  }

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    throw new Error('Rating must be an integer between 1 and 5.');
  }

  // 1. Verify session exists and is completed
  const { data: session, error: sessError } = await client
    .from('sessions')
    .select(`
      id,
      teacher_id,
      learner_id,
      status,
      skill:skill_id (name),
      teacher:teacher_id (full_name),
      learner:learner_id (full_name)
    `)
    .eq('id', sessionId)
    .single();

  if (sessError || !session) {
    throw new Error('Session not found.');
  }

  if (session.status !== 'completed') {
    throw new Error('Reviews can only be submitted for completed sessions.');
  }

  // 2. Validate reviewer was a participant and identify reviewee
  if (session.teacher_id !== reviewerId && session.learner_id !== reviewerId) {
    throw new Error('You can only review sessions you participated in.');
  }

  const revieweeId = session.teacher_id === reviewerId ? session.learner_id : session.teacher_id;
  const reviewerName = session.teacher_id === reviewerId ? session.teacher?.full_name : session.learner?.full_name;

  // 3. Prevent duplicate review for the same session by the same reviewer
  const { data: existingReview } = await client
    .from('reviews')
    .select('id')
    .eq('session_id', sessionId)
    .eq('reviewer_id', reviewerId)
    .maybeSingle();

  if (existingReview) {
    throw new Error('You have already submitted a review for this session.');
  }

  // 4. Insert review
  const { data: newReview, error: insertError } = await client
    .from('reviews')
    .insert({
      session_id: sessionId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating: numericRating,
      comment: comment.trim(),
    })
    .select(`
      id,
      session_id,
      reviewer_id,
      reviewee_id,
      rating,
      comment,
      created_at,
      reviewer:reviewer_id (id, full_name, username, avatar_url)
    `)
    .single();

  if (insertError) throw insertError;

  // 5. Recalculate average rating & review count for reviewee
  try {
    const { data: allReviews, error: revError } = await client
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', revieweeId);

    if (!revError && allReviews && allReviews.length > 0) {
      const totalRatings = allReviews.length;
      const sumRatings = allReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
      const avgRating = Math.round((sumRatings / totalRatings) * 10) / 10;

      await client
        .from('profiles')
        .update({
          rating_avg: avgRating,
          rating_count: totalRatings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', revieweeId);
    }
  } catch (calcErr) {
    console.warn('Rating recalculation notice:', calcErr.message);
  }

  // 6. Dispatch notification to reviewee
  await createNotification({
    userId: revieweeId,
    type: 'review_received',
    title: 'New Review Received! ⭐',
    body: `${reviewerName || 'Your exchange partner'} left you a ${numericRating}★ review for ${session.skill?.name || 'your session'}.`,
    actionUrl: `/profile`,
  });

  return newReview;
}

/**
 * 2. Get Reviews for a User
 */
export async function getUserReviews(userId) {
  if (!isSupabaseConfigured() || !userId) return [];

  const { data, error } = await client
    .from('reviews')
    .select(`
      id,
      session_id,
      reviewer_id,
      reviewee_id,
      rating,
      comment,
      created_at,
      reviewer:reviewer_id (id, full_name, username, avatar_url)
    `)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * 3. Get Reviews for a Session
 */
export async function getSessionReviews(sessionId) {
  if (!isSupabaseConfigured() || !sessionId) return [];

  const { data, error } = await client
    .from('reviews')
    .select(`
      id,
      session_id,
      reviewer_id,
      reviewee_id,
      rating,
      comment,
      created_at,
      reviewer:reviewer_id (id, full_name, username, avatar_url)
    `)
    .eq('session_id', sessionId);

  if (error) throw error;
  return data || [];
}
