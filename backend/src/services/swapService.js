import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { createNotification } from './notificationService.js';

const client = supabaseAdmin || supabase;

/**
 * Helper to resolve skill ID from UUID or Name
 */
async function resolveSkillId(skillIdentifier) {
  if (!skillIdentifier) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(skillIdentifier);
  if (isUuid) return skillIdentifier;

  const { data: existing } = await client
    .from('skills')
    .select('id')
    .ilike('name', skillIdentifier.trim())
    .limit(1)
    .single();

  if (existing?.id) return existing.id;

  // If not found by exact name, search with ilike
  const { data: partial } = await client
    .from('skills')
    .select('id')
    .ilike('name', `%${skillIdentifier.trim()}%`)
    .limit(1)
    .single();

  return partial?.id || null;
}

/**
 * Helper to ensure a 1-to-1 conversation exists for two users
 */
async function getOrCreateConversation(userAId, userBId, swapRequestId = null, title = null) {
  // Check if conversation already exists for this swap request
  if (swapRequestId) {
    const { data: existingConv } = await client
      .from('conversations')
      .select('id')
      .eq('swap_request_id', swapRequestId)
      .limit(1)
      .single();

    if (existingConv?.id) {
      // Ensure both are members
      await client.from('conversation_members').upsert([
        { conversation_id: existingConv.id, user_id: userAId },
        { conversation_id: existingConv.id, user_id: userBId },
      ], { onConflict: 'conversation_id,user_id' });

      return existingConv.id;
    }
  }

  // Create new conversation
  const { data: newConv, error: convError } = await client
    .from('conversations')
    .insert({
      swap_request_id: swapRequestId,
      title: title || 'Skill Exchange Chat',
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (convError) throw convError;

  // Insert both users into conversation_members
  await client.from('conversation_members').insert([
    { conversation_id: newConv.id, user_id: userAId },
    { conversation_id: newConv.id, user_id: userBId },
  ]);

  return newConv.id;
}

/**
 * 1. Send Exchange Request
 */
export async function createSwapRequest({
  senderId,
  receiverId,
  offeredSkill,
  requestedSkill,
  message = '',
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase database is not configured');
  }

  if (!senderId || !receiverId) {
    throw new Error('Sender ID and Receiver ID are required');
  }

  if (senderId === receiverId) {
    throw new Error('You cannot send a skill exchange request to yourself.');
  }

  // Resolve skill IDs
  const offeredSkillId = await resolveSkillId(offeredSkill);
  const requestedSkillId = await resolveSkillId(requestedSkill);

  if (!offeredSkillId) {
    throw new Error(`The offered skill "${offeredSkill}" could not be identified.`);
  }

  if (!requestedSkillId) {
    throw new Error(`The requested skill "${requestedSkill}" could not be identified.`);
  }

  // Prevent duplicate pending requests between these two users
  const { data: existingPending, error: dupErr } = await client
    .from('swap_requests')
    .select('id, status')
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('offered_skill_id', offeredSkillId)
    .eq('requested_skill_id', requestedSkillId)
    .eq('status', 'pending')
    .limit(1);

  if (existingPending && existingPending.length > 0) {
    throw new Error('A pending exchange request for these skills is already active with this member.');
  }

  // Insert the swap request record
  const { data: swapRequest, error: insertError } = await client
    .from('swap_requests')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      offered_skill_id: offeredSkillId,
      requested_skill_id: requestedSkillId,
      status: 'pending',
      message: message.trim() || 'Hi! I would love to propose a skill exchange with you.',
    })
    .select(`
      id,
      sender_id,
      receiver_id,
      offered_skill_id,
      requested_skill_id,
      status,
      message,
      created_at,
      sender:sender_id (id, full_name, username, avatar_url),
      receiver:receiver_id (id, full_name, username, avatar_url),
      offered_skill:offered_skill_id (id, name, slug),
      requested_skill:requested_skill_id (id, name, slug)
    `)
    .single();

  if (insertError) throw insertError;

  // Create linked conversation and initial message
  try {
    const conversationId = await getOrCreateConversation(
      senderId,
      receiverId,
      swapRequest.id,
      `Swap: ${swapRequest.offered_skill?.name} ⇄ ${swapRequest.requested_skill?.name}`
    );

    if (message.trim()) {
      await client.from('messages').insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: message.trim(),
        is_read: false,
      });
    }

    swapRequest.conversation_id = conversationId;
  } catch (convErr) {
    console.warn('Conversation creation notice:', convErr.message);
  }

  // Dispatch Notification to receiver
  await createNotification({
    userId: receiverId,
    type: 'swap_request_received',
    title: 'New Skill Swap Proposal! ✨',
    body: `${swapRequest.sender?.full_name || 'A swapper'} wants to exchange ${swapRequest.offered_skill?.name} for your ${swapRequest.requested_skill?.name}.`,
    actionUrl: '/exchanges?tab=requests',
  });

  return swapRequest;
}

/**
 * 2. Get User Swap Requests (Incoming & Outgoing)
 */
export async function getUserSwapRequests(userId) {
  if (!isSupabaseConfigured() || !userId) {
    return { incoming: [], outgoing: [] };
  }

  const queryFields = `
    id,
    sender_id,
    receiver_id,
    offered_skill_id,
    requested_skill_id,
    status,
    message,
    responded_at,
    created_at,
    updated_at,
    sender:sender_id (id, full_name, username, avatar_url, location, rating_avg, rating_count),
    receiver:receiver_id (id, full_name, username, avatar_url, location, rating_avg, rating_count),
    offered_skill:offered_skill_id (id, name, slug, description),
    requested_skill:requested_skill_id (id, name, slug, description),
    conversations (id)
  `;

  const [incomingRes, outgoingRes] = await Promise.all([
    client
      .from('swap_requests')
      .select(queryFields)
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false }),
    client
      .from('swap_requests')
      .select(queryFields)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (incomingRes.error) throw incomingRes.error;
  if (outgoingRes.error) throw outgoingRes.error;

  const mapRequest = (r) => ({
    ...r,
    conversationId: r.conversations?.[0]?.id || null,
  });

  return {
    incoming: (incomingRes.data || []).map(mapRequest),
    outgoing: (outgoingRes.data || []).map(mapRequest),
  };
}

/**
 * 3. Accept Exchange Request
 */
export async function acceptSwapRequest({ swapId, userId }) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  // Verify swap request exists and user is the receiver
  const { data: swap, error: fetchErr } = await client
    .from('swap_requests')
    .select(`
      *,
      sender:sender_id (id, full_name, username),
      receiver:receiver_id (id, full_name, username),
      offered_skill:offered_skill_id (id, name),
      requested_skill:requested_skill_id (id, name)
    `)
    .eq('id', swapId)
    .single();

  if (fetchErr || !swap) throw new Error('Exchange request not found');

  if (swap.receiver_id !== userId) {
    throw new Error('Only the recipient of a swap request can accept it.');
  }

  if (swap.status !== 'pending') {
    throw new Error(`This request is already ${swap.status}.`);
  }

  // Update status to accepted
  const { data: updated, error: updateErr } = await client
    .from('swap_requests')
    .update({
      status: 'accepted',
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', swapId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  // Activate or create match record in public.matches
  const uA = swap.sender_id < swap.receiver_id ? swap.sender_id : swap.receiver_id;
  const uB = swap.sender_id < swap.receiver_id ? swap.receiver_id : swap.sender_id;
  const uASkill = swap.sender_id < swap.receiver_id ? swap.offered_skill_id : swap.requested_skill_id;
  const uBSkill = swap.sender_id < swap.receiver_id ? swap.requested_skill_id : swap.offered_skill_id;

  try {
    await client.from('matches').upsert(
      {
        user_a_id: uA,
        user_b_id: uB,
        user_a_skill_id: uASkill,
        user_b_skill_id: uBSkill,
        compatibility_score: 100.0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_a_id,user_b_id,user_a_skill_id,user_b_skill_id' }
    );
  } catch (mErr) {
    console.warn('Match upsert note:', mErr.message);
  }

  // Ensure conversation exists & post system announcement
  const conversationId = await getOrCreateConversation(
    swap.sender_id,
    swap.receiver_id,
    swap.id,
    `Swap: ${swap.offered_skill?.name} ⇄ ${swap.requested_skill?.name}`
  );

  await client.from('messages').insert({
    conversation_id: conversationId,
    sender_id: userId,
    content: `🎉 I accepted the skill exchange! Excited to trade ${swap.requested_skill?.name} and learn ${swap.offered_skill?.name}. Let's schedule our first session!`,
    is_read: false,
  });

  // Notify the original sender
  await createNotification({
    userId: swap.sender_id,
    type: 'swap_request_accepted',
    title: 'Swap Request Accepted! 🎉',
    body: `${swap.receiver?.full_name} accepted your exchange proposal for ${swap.requested_skill?.name}! You can now schedule your sessions.`,
    actionUrl: '/exchanges?tab=sessions',
  });

  return {
    ...updated,
    conversationId,
  };
}

/**
 * 4. Reject Exchange Request
 */
export async function rejectSwapRequest({ swapId, userId, reason = '' }) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  const { data: swap, error: fetchErr } = await client
    .from('swap_requests')
    .select('*, sender:sender_id (full_name), receiver:receiver_id (full_name), requested_skill:requested_skill_id (name)')
    .eq('id', swapId)
    .single();

  if (fetchErr || !swap) throw new Error('Exchange request not found');

  if (swap.receiver_id !== userId) {
    throw new Error('Only the recipient of a swap request can reject it.');
  }

  if (swap.status !== 'pending') {
    throw new Error(`This request is already ${swap.status}.`);
  }

  const { data: updated, error: updateErr } = await client
    .from('swap_requests')
    .update({
      status: 'rejected',
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', swapId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  // Notify sender
  await createNotification({
    userId: swap.sender_id,
    type: 'swap_request_rejected',
    title: 'Swap Request Update',
    body: `${swap.receiver?.full_name || 'The swapper'} was unable to accept your proposal for ${swap.requested_skill?.name} at this time.`,
    actionUrl: '/exchanges?tab=requests',
  });

  return updated;
}

/**
 * 5. Cancel Pending Request (By Sender)
 */
export async function cancelSwapRequest({ swapId, userId }) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  const { data: swap, error: fetchErr } = await client
    .from('swap_requests')
    .select('id, sender_id, status')
    .eq('id', swapId)
    .single();

  if (fetchErr || !swap) throw new Error('Exchange request not found');

  if (swap.sender_id !== userId) {
    throw new Error('Only the sender of a swap request can cancel it.');
  }

  if (swap.status !== 'pending') {
    throw new Error(`Cannot cancel a request that is already ${swap.status}.`);
  }

  const { data: updated, error: updateErr } = await client
    .from('swap_requests')
    .update({
      status: 'cancelled',
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', swapId)
    .select()
    .single();

  if (updateErr) throw updateErr;
  return updated;
}
