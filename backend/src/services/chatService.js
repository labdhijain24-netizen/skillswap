import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { createNotification } from './notificationService.js';

const client = supabaseAdmin || supabase;

/**
 * 1. Get User Conversations List
 */
export async function getUserConversations(userId) {
  if (!isSupabaseConfigured() || !userId) return [];

  // 1. Get all conversation IDs where this user is a member
  const { data: memberRows, error: memberErr } = await client
    .from('conversation_members')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (memberErr) throw memberErr;
  if (!memberRows || memberRows.length === 0) return [];

  const convIds = memberRows.map((m) => m.conversation_id);
  const memberLastReadMap = {};
  memberRows.forEach((m) => {
    memberLastReadMap[m.conversation_id] = m.last_read_at;
  });

  // 2. Fetch conversations details with members and linked swap requests
  const [convsRes, allMembersRes, latestMessagesRes] = await Promise.all([
    client
      .from('conversations')
      .select(`
        id,
        swap_request_id,
        title,
        last_message_at,
        created_at,
        swap_requests (
          id,
          status,
          offered_skill:offered_skill_id (name),
          requested_skill:requested_skill_id (name)
        )
      `)
      .in('id', convIds)
      .order('last_message_at', { ascending: false }),

    client
      .from('conversation_members')
      .select(`
        conversation_id,
        user_id,
        profiles (id, full_name, username, avatar_url, location)
      `)
      .in('conversation_id', convIds),

    client
      .from('messages')
      .select('id, conversation_id, sender_id, content, is_read, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false }),
  ]);

  if (convsRes.error) throw convsRes.error;

  // Map other member per conversation
  const otherMemberMap = {};
  (allMembersRes.data || []).forEach((row) => {
    if (row.user_id !== userId) {
      otherMemberMap[row.conversation_id] = row.profiles;
    }
  });

  // Group latest messages & count unread per conversation
  const latestMessageMap = {};
  const unreadCountMap = {};

  convIds.forEach((id) => {
    unreadCountMap[id] = 0;
  });

  (latestMessagesRes.data || []).forEach((msg) => {
    if (!latestMessageMap[msg.conversation_id]) {
      latestMessageMap[msg.conversation_id] = msg;
    }
    if (msg.sender_id !== userId && !msg.is_read) {
      unreadCountMap[msg.conversation_id] = (unreadCountMap[msg.conversation_id] || 0) + 1;
    }
  });

  // Assemble conversations list
  return (convsRes.data || []).map((conv) => {
    const otherMember = otherMemberMap[conv.id] || null;
    const lastMsg = latestMessageMap[conv.id] || null;
    const unreadCount = unreadCountMap[conv.id] || 0;

    return {
      id: conv.id,
      swapRequestId: conv.swap_request_id,
      swapDetails: conv.swap_requests,
      title: conv.title,
      lastMessageAt: conv.last_message_at,
      otherMember,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            senderId: lastMsg.sender_id,
            createdAt: lastMsg.created_at,
            isRead: lastMsg.is_read,
          }
        : null,
      unreadCount,
    };
  });
}

/**
 * 2. Get Messages for Conversation
 */
export async function getConversationMessages(conversationId, userId) {
  if (!isSupabaseConfigured() || !conversationId) return [];

  // Verify membership
  const { data: memberCheck } = await client
    .from('conversation_members')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single();

  if (!memberCheck) {
    throw new Error('You are not authorized to view this conversation.');
  }

  // Fetch messages
  const { data: messages, error } = await client
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      is_read,
      created_at,
      sender:sender_id (id, full_name, username, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Mark all unread messages sent by the other party as read
  await client
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  // Update last_read_at in conversation_members
  await client
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  return messages || [];
}

/**
 * 3. Send Message
 */
export async function sendMessage({ conversationId, senderId, content }) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  if (!content || !content.trim()) {
    throw new Error('Message content cannot be empty.');
  }

  // Verify sender is member of conversation
  const { data: memberCheck } = await client
    .from('conversation_members')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', senderId)
    .single();

  if (!memberCheck) {
    throw new Error('You must be a member of this conversation to send a message.');
  }

  // 1. Insert message
  const { data: message, error: msgError } = await client
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
      is_read: false,
    })
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      is_read,
      created_at,
      sender:sender_id (id, full_name, username, avatar_url)
    `)
    .single();

  if (msgError) throw msgError;

  // 2. Update conversation's last_message_at
  await client
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  // 3. Notify other conversation member(s)
  const { data: otherMembers } = await client
    .from('conversation_members')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', senderId);

  if (otherMembers && otherMembers.length > 0) {
    for (const member of otherMembers) {
      await createNotification({
        userId: member.user_id,
        type: 'new_message',
        title: `Message from ${message.sender?.full_name || 'Swapper'}`,
        body: content.trim().length > 60 ? `${content.trim().substring(0, 60)}...` : content.trim(),
        actionUrl: `/exchanges?tab=messages&convId=${conversationId}`,
      });
    }
  }

  return message;
}

/**
 * 4. Mark Conversation as Read
 */
export async function markConversationAsRead({ conversationId, userId }) {
  if (!isSupabaseConfigured()) return;

  await Promise.all([
    client
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false),

    client
      .from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId),
  ]);

  return { success: true };
}
