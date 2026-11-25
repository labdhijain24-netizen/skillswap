-- ============================================================================
-- SkillSwap Migration 003: Row Level Security (RLS) Policies
-- Strict user ownership, privacy and access restriction rules
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable RLS on all 15 public tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanted_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Profiles Policies
-- Anyone can view profiles to browse skill matches. Only owner can update.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 3. Skill Categories & Skills Policies
-- Read access is public. Creation/edits restricted to service role or admin.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Skill categories viewable by all" ON public.skill_categories;
CREATE POLICY "Skill categories viewable by all"
    ON public.skill_categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Skills viewable by all" ON public.skills;
CREATE POLICY "Skills viewable by all"
    ON public.skills FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 4. User Skills & Wanted Skills Policies
-- Viewable by everyone for matching. Full CRUD only for skill owner.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "User skills viewable by all" ON public.user_skills;
CREATE POLICY "User skills viewable by all"
    ON public.user_skills FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own teaching skills" ON public.user_skills;
CREATE POLICY "Users can insert their own teaching skills"
    ON public.user_skills FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own teaching skills" ON public.user_skills;
CREATE POLICY "Users can update their own teaching skills"
    ON public.user_skills FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own teaching skills" ON public.user_skills;
CREATE POLICY "Users can delete their own teaching skills"
    ON public.user_skills FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Wanted skills viewable by all" ON public.wanted_skills;
CREATE POLICY "Wanted skills viewable by all"
    ON public.wanted_skills FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own wanted skills" ON public.wanted_skills;
CREATE POLICY "Users can insert their own wanted skills"
    ON public.wanted_skills FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wanted skills" ON public.wanted_skills;
CREATE POLICY "Users can update their own wanted skills"
    ON public.wanted_skills FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wanted skills" ON public.wanted_skills;
CREATE POLICY "Users can delete their own wanted skills"
    ON public.wanted_skills FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. User Interests & Availability Policies
-- Public read for discovery. CRUD restricted to authenticated owner.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "User interests viewable by all" ON public.user_interests;
CREATE POLICY "User interests viewable by all"
    ON public.user_interests FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can manage their own interests" ON public.user_interests;
CREATE POLICY "Users can manage their own interests"
    ON public.user_interests FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Availability viewable by all" ON public.availability;
CREATE POLICY "Availability viewable by all"
    ON public.availability FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can manage their own availability" ON public.availability;
CREATE POLICY "Users can manage their own availability"
    ON public.availability FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. Swap Requests Policies
-- Visible only to sender or receiver.
-- Sender creates. Both can update status (accept, reject, cancel).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own swap requests" ON public.swap_requests;
CREATE POLICY "Users can view their own swap requests"
    ON public.swap_requests FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can create swap requests" ON public.swap_requests;
CREATE POLICY "Users can create swap requests"
    ON public.swap_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Participants can update swap requests" ON public.swap_requests;
CREATE POLICY "Participants can update swap requests"
    ON public.swap_requests FOR UPDATE
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ----------------------------------------------------------------------------
-- 7. Matches Policies
-- Visible only to matched users A or B.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
CREATE POLICY "Users can view their own matches"
    ON public.matches FOR SELECT
    TO authenticated
    USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

DROP POLICY IF EXISTS "Users can dismiss their own matches" ON public.matches;
CREATE POLICY "Users can dismiss their own matches"
    ON public.matches FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_a_id OR auth.uid() = user_b_id)
    WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- ----------------------------------------------------------------------------
-- 8. Conversations & Members Policies
-- Users can only see and participate in conversations they are members of.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view conversations" ON public.conversations;
CREATE POLICY "Members can view conversations"
    ON public.conversations FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = conversations.id
            AND conversation_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
    ON public.conversations FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Members can view conversation members" ON public.conversation_members;
CREATE POLICY "Members can view conversation members"
    ON public.conversation_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members AS cm
            WHERE cm.conversation_id = conversation_members.conversation_id
            AND cm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_members;
CREATE POLICY "Users can join conversations"
    ON public.conversation_members FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 9. Messages Policies
-- Users can read messages only from conversations they belong to.
-- Users can only send messages as themselves to conversations they belong to.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view conversation messages" ON public.messages;
CREATE POLICY "Members can view conversation messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = messages.conversation_id
            AND conversation_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Members can post messages" ON public.messages;
CREATE POLICY "Members can post messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = messages.conversation_id
            AND conversation_members.user_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 10. Sessions Policies
-- Only the participating teacher or learner can view and update sessions.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Participants can view their sessions" ON public.sessions;
CREATE POLICY "Participants can view their sessions"
    ON public.sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

DROP POLICY IF EXISTS "Participants can schedule sessions" ON public.sessions;
CREATE POLICY "Participants can schedule sessions"
    ON public.sessions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

DROP POLICY IF EXISTS "Participants can update their sessions" ON public.sessions;
CREATE POLICY "Participants can update their sessions"
    ON public.sessions FOR UPDATE
    TO authenticated
    USING (auth.uid() = teacher_id OR auth.uid() = learner_id)
    WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- ----------------------------------------------------------------------------
-- 11. Reviews Policies
-- Reviews are publicly viewable to foster trust and reputation.
-- Only participants can author a review, and only once per session.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Session participants can write reviews" ON public.reviews;
CREATE POLICY "Session participants can write reviews"
    ON public.reviews FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = reviews.session_id
            AND (sessions.teacher_id = auth.uid() OR sessions.learner_id = auth.uid())
            AND sessions.status = 'completed'
        )
    );

-- ----------------------------------------------------------------------------
-- 12. Notifications Policies
-- Users can only read and update their own notifications.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark their own notifications as read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications as read"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
