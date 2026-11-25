import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

const client = supabaseAdmin || supabase;

/**
 * Helper to dispatch in-app notifications
 */
export async function createNotification({
  userId,
  type = 'system',
  title,
  body,
  actionUrl = '/exchanges',
}) {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const { data, error } = await client
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        action_url: actionUrl,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.warn('Notification insert note:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Notification error:', err.message);
    return null;
  }
}

/**
 * Fetch all notifications for a user
 */
export async function getUserNotifications(userId) {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data || [];
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId, userId) {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await client
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark all user notifications as read
 */
export async function markAllNotificationsAsRead(userId) {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await client
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();

  if (error) throw error;
  return data || [];
}
