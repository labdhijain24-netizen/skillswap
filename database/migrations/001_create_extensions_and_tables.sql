-- ============================================================================
-- SkillSwap Migration 001: Extensions, Tables, Foreign Keys & Indexes
-- Normalization: 3NF Relational Database Schema
-- User Identity: Direct linkage to auth.users (Supabase Auth)
-- ============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE 1: PROFILES
-- 1-to-1 extension of Supabase auth.users with public profile metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    time_zone TEXT DEFAULT 'UTC' NOT NULL,
    preferred_learning_mode TEXT DEFAULT 'flexible' CHECK (preferred_learning_mode IN ('online', 'in-person', 'flexible')),
    onboarding_completed BOOLEAN DEFAULT false NOT NULL,
    rating_avg NUMERIC(3, 2) DEFAULT 0.00 NOT NULL CHECK (rating_avg >= 0.00 AND rating_avg <= 5.00),
    rating_count INTEGER DEFAULT 0 NOT NULL CHECK (rating_count >= 0),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TABLE 2: SKILL CATEGORIES
-- High-level taxonomy grouping skills (e.g. Technology, Languages, Music)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TABLE 3: SKILLS
-- Master catalog of canonical skills
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE RESTRICT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TABLE 4: USER SKILLS (Skills users teach)
-- Many-to-Many junction table linking profiles to skills they offer to teach
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    experience_years NUMERIC(3, 1) DEFAULT 1.0 CHECK (experience_years >= 0),
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_skill UNIQUE (user_id, skill_id)
);

-- ============================================================================
-- TABLE 5: WANTED SKILLS (Skills users want to learn)
-- Many-to-Many junction table linking profiles to skills they want to learn
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wanted_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    target_proficiency TEXT NOT NULL CHECK (target_proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_wanted_skill UNIQUE (user_id, skill_id)
);

-- ============================================================================
-- TABLE 6: USER INTERESTS
-- General topic areas/hobbies beyond technical or specific skills
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.skill_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_interest UNIQUE (user_id, name)
);

-- ============================================================================
-- TABLE 7: AVAILABILITY
-- User schedule windows for planning swaps (day of week + time range)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, ..., 6=Sat
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    time_zone TEXT NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_valid_time_interval CHECK (start_time < end_time)
);

-- ============================================================================
-- TABLE 8: SWAP REQUESTS
-- Proposal from user A to user B proposing a bilateral skill exchange
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    offered_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    requested_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    message TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_swap_distinct_users CHECK (sender_id <> receiver_id)
);

-- ============================================================================
-- TABLE 9: MATCHES
-- Bilateral matches where user A teaches what B wants & B teaches what A wants
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_a_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    user_b_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    compatibility_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00 CHECK (compatibility_score >= 0),
    is_dismissed_by_a BOOLEAN DEFAULT false NOT NULL,
    is_dismissed_by_b BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_matches_canonical_order CHECK (user_a_id < user_b_id),
    CONSTRAINT uq_bilateral_match UNIQUE (user_a_id, user_b_id, user_a_skill_id, user_b_skill_id)
);

-- ============================================================================
-- TABLE 10: CONVERSATIONS
-- Messaging channels between users negotiating swaps or sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swap_request_id UUID REFERENCES public.swap_requests(id) ON DELETE SET NULL,
    title TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TABLE 11: CONVERSATION MEMBERS
-- Membership table mapping users to conversations (supports group or 1-1)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_conversation_member UNIQUE (conversation_id, user_id)
);

-- ============================================================================
-- TABLE 12: MESSAGES
-- Individual text messages inside a conversation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TABLE 13: SESSIONS
-- Scheduled teaching/learning sessions with calendar time and video link
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swap_request_id UUID NOT NULL REFERENCES public.swap_requests(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    meeting_link TEXT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_session_distinct_users CHECK (teacher_id <> learner_id),
    CONSTRAINT chk_session_valid_time CHECK (scheduled_start < scheduled_end)
);

-- ============================================================================
-- TABLE 14: REVIEWS
-- Post-session ratings and qualitative testimonials
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_review_distinct_users CHECK (reviewer_id <> reviewee_id),
    CONSTRAINT uq_session_reviewer UNIQUE (session_id, reviewer_id)
);

-- ============================================================================
-- TABLE 15: NOTIFICATIONS
-- Real-time in-app alerts and notifications for users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'swap_request_received', 
        'swap_request_accepted', 
        'swap_request_rejected', 
        'session_scheduled', 
        'session_reminder', 
        'review_received', 
        'new_message', 
        'new_match', 
        'system'
    )),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PERFORMANCE & QUERY INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating_avg DESC);

-- Skill indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills(name);

-- User skills indexes
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON public.user_skills(skill_id);

-- Wanted skills indexes
CREATE INDEX IF NOT EXISTS idx_wanted_skills_user ON public.wanted_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_wanted_skills_skill ON public.wanted_skills(skill_id);

-- Availability indexes
CREATE INDEX IF NOT EXISTS idx_availability_user_day ON public.availability(user_id, day_of_week);

-- Swap requests indexes
CREATE INDEX IF NOT EXISTS idx_swap_requests_sender ON public.swap_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_receiver ON public.swap_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON public.swap_requests(status);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON public.matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON public.matches(user_b_id);

-- Conversations & Messages indexes
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON public.sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_learner ON public.sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON public.sessions(scheduled_start);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_session ON public.reviews(session_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
