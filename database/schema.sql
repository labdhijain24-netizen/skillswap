-- ============================================================================
-- SkillSwap - Full Relational Database Schema (All-in-One)
-- Tables: 15 Normalized Tables
-- Identity: Linked to Supabase auth.users
-- Features: 3NF normalization, RLS policies, automated triggers, performance indexes
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABLES & CONSTRAINTS
-- ============================================================================

-- Table 1: Profiles (1:1 with auth.users)
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

-- Table 2: Skill Categories
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 3: Skills
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE RESTRICT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 4: User Skills (What users teach)
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

-- Table 5: Wanted Skills (What users want to learn)
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

-- Table 6: User Interests
CREATE TABLE IF NOT EXISTS public.user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.skill_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_interest UNIQUE (user_id, name)
);

-- Table 7: Availability
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    time_zone TEXT NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_valid_time_interval CHECK (start_time < end_time)
);

-- Table 8: Swap Requests
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

-- Table 9: Matches
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

-- Table 10: Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swap_request_id UUID REFERENCES public.swap_requests(id) ON DELETE SET NULL,
    title TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 11: Conversation Members
CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_conversation_member UNIQUE (conversation_id, user_id)
);

-- Table 12: Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table 13: Sessions
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

-- Table 14: Reviews
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

-- Table 15: Notifications
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
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills(name);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_wanted_skills_user ON public.wanted_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_wanted_skills_skill ON public.wanted_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_availability_user_day ON public.availability(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_swap_requests_sender ON public.swap_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_receiver ON public.swap_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON public.swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON public.matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON public.matches(user_b_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON public.sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_learner ON public.sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON public.sessions(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_session ON public.reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: updated_at handler
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_skill_categories_updated_at BEFORE UPDATE ON public.skill_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_user_skills_updated_at BEFORE UPDATE ON public.user_skills FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_wanted_skills_updated_at BEFORE UPDATE ON public.wanted_skills FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_availability_updated_at BEFORE UPDATE ON public.availability FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_swap_requests_updated_at BEFORE UPDATE ON public.swap_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function: Auto create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_username TEXT;
    clean_username TEXT;
    raw_full_name TEXT;
BEGIN
    raw_username := NEW.raw_user_meta_data->>'username';
    IF raw_username IS NULL OR raw_username = '' THEN
        raw_username := split_part(NEW.email, '@', 1);
    END IF;

    clean_username := lower(regexp_replace(raw_username, '[^a-zA-Z0-9_]', '', 'g'));
    IF clean_username = '' THEN
        clean_username := 'user_' || substr(NEW.id::text, 1, 6);
    END IF;

    raw_full_name := NEW.raw_user_meta_data->>'full_name';
    IF raw_full_name IS NULL OR raw_full_name = '' THEN
        raw_full_name := clean_username;
    END IF;

    INSERT INTO public.profiles (id, username, full_name, avatar_url, bio)
    VALUES (NEW.id, clean_username, raw_full_name, NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'bio')
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Auto update profile average rating
CREATE OR REPLACE FUNCTION public.handle_review_rating_update()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    new_avg NUMERIC(3, 2);
    new_count INTEGER;
BEGIN
    target_user_id := COALESCE(NEW.reviewee_id, OLD.reviewee_id);

    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00), COUNT(*)
    INTO new_avg, new_count
    FROM public.reviews
    WHERE reviewee_id = target_user_id;

    UPDATE public.profiles
    SET rating_avg = new_avg, rating_count = new_count, updated_at = NOW()
    WHERE id = target_user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_rating_on_review ON public.reviews;
CREATE TRIGGER trg_update_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_review_rating_update();

-- Function: Auto update last_message_at
CREATE OR REPLACE FUNCTION public.handle_message_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at, updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_conv_on_message ON public.messages;
CREATE TRIGGER trg_update_conv_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_message_conversation_timestamp();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
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

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Categories & Skills
CREATE POLICY "Skill categories viewable by all" ON public.skill_categories FOR SELECT USING (true);
CREATE POLICY "Skills viewable by all" ON public.skills FOR SELECT USING (true);

-- User skills & Wanted skills
CREATE POLICY "User skills viewable by all" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can insert their own teaching skills" ON public.user_skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own teaching skills" ON public.user_skills FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own teaching skills" ON public.user_skills FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Wanted skills viewable by all" ON public.wanted_skills FOR SELECT USING (true);
CREATE POLICY "Users can insert their own wanted skills" ON public.wanted_skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wanted skills" ON public.wanted_skills FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wanted skills" ON public.wanted_skills FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Interests & Availability
CREATE POLICY "User interests viewable by all" ON public.user_interests FOR SELECT USING (true);
CREATE POLICY "Users can manage their own interests" ON public.user_interests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Availability viewable by all" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Users can manage their own availability" ON public.availability FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Swap requests
CREATE POLICY "Users can view their own swap requests" ON public.swap_requests FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create swap requests" ON public.swap_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Participants can update swap requests" ON public.swap_requests FOR UPDATE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id) WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Matches
CREATE POLICY "Users can view their own matches" ON public.matches FOR SELECT TO authenticated USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users can dismiss their own matches" ON public.matches FOR UPDATE TO authenticated USING (auth.uid() = user_a_id OR auth.uid() = user_b_id) WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Conversations & Members
CREATE POLICY "Members can view conversations" ON public.conversations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_members.conversation_id = conversations.id AND conversation_members.user_id = auth.uid()));
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Members can view conversation members" ON public.conversation_members FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversation_members AS cm WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid()));
CREATE POLICY "Users can join conversations" ON public.conversation_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Messages
CREATE POLICY "Members can view conversation messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid()));
CREATE POLICY "Members can post messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid()));

-- Sessions
CREATE POLICY "Participants can view their sessions" ON public.sessions FOR SELECT TO authenticated USING (auth.uid() = teacher_id OR auth.uid() = learner_id);
CREATE POLICY "Participants can schedule sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);
CREATE POLICY "Participants can update their sessions" ON public.sessions FOR UPDATE TO authenticated USING (auth.uid() = teacher_id OR auth.uid() = learner_id) WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Session participants can write reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id AND EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = reviews.session_id AND (sessions.teacher_id = auth.uid() OR sessions.learner_id = auth.uid()) AND sessions.status = 'completed'));

-- Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can mark their own notifications as read" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- 6. CANONICAL SEED DATA
-- ============================================================================
INSERT INTO public.skill_categories (name, slug, description, icon) VALUES
    ('Programming & Tech', 'programming-tech', 'Software development, web design, cloud, and IT skills', 'Code'),
    ('Design & Creative', 'design-creative', 'UI/UX design, illustration, 3D modeling, and graphic arts', 'Palette'),
    ('Languages', 'languages', 'World languages, conversational fluency, and translation', 'Languages'),
    ('Music & Audio', 'music-audio', 'Musical instruments, vocal coaching, music theory, and audio production', 'Music'),
    ('Business & Marketing', 'business-marketing', 'Entrepreneurship, SEO, product management, and copywriting', 'Briefcase'),
    ('Photography & Video', 'photography-video', 'Camera techniques, lighting, video editing, and color grading', 'Camera'),
    ('Health & Fitness', 'health-fitness', 'Strength training, yoga, nutrition, and wellness practices', 'HeartPulse'),
    ('Culinary Arts', 'culinary-arts', 'Baking, cooking techniques, culinary knife skills, and food plating', 'Utensils')
ON CONFLICT (name) DO NOTHING;

WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'programming-tech')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('JavaScript', 'javascript', 'Modern ECMAScript, closures, async/await, and DOM manipulation'),
    ('React.js', 'react-js', 'Component architecture, React hooks, state management, and Vite'),
    ('Node.js & Express', 'node-express', 'REST APIs, server-side development, middleware, and backend architecture'),
    ('Python', 'python', 'Python fundamentals, data processing, scripting, and automation'),
    ('TypeScript', 'typescript', 'Static typing, interfaces, generics, and large-scale JavaScript development'),
    ('PostgreSQL & SQL', 'postgresql-sql', 'Relational database schema design, queries, joins, and indexing'),
    ('Docker & Containers', 'docker-containers', 'Containerizing applications, Dockerfile writing, and microservices')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'design-creative')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('UI/UX Design in Figma', 'ui-ux-figma', 'Wireframing, interactive prototyping, design systems, and auto-layout'),
    ('Logo & Brand Identity', 'logo-brand-identity', 'Vector logo creation, visual identity guidelines, and typography'),
    ('Graphic Design with Photoshop', 'graphic-design-photoshop', 'Photo manipulation, digital compositing, and visual graphics'),
    ('3D Modeling with Blender', '3d-blender', 'Polygon modeling, materials, lighting, and rendering in Blender')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'languages')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('Conversational Spanish', 'conversational-spanish', 'Everyday dialogue, grammar essentials, and pronunciation'),
    ('Conversational French', 'conversational-french', 'French vocabulary, conversational phrasing, and listening comprehension'),
    ('Japanese for Beginners', 'japanese-beginners', 'Hiragana, Katakana, basic Kanji, and everyday polite phrases'),
    ('German Fundamentals', 'german-fundamentals', 'Sentence structures, cases, everyday conversation, and pronunciation'),
    ('English for Professionals', 'english-professionals', 'Business presentations, professional writing, and interview practice')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'music-audio')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('Acoustic Guitar', 'acoustic-guitar', 'Chords, fingerpicking, rhythm, and song accompaniment'),
    ('Piano & Keyboard', 'piano-keyboard', 'Scales, chord progressions, reading sheet music, and ear training'),
    ('Music Production in Ableton', 'music-production-ableton', 'Beat making, MIDI sequencing, synthesis, and mixing'),
    ('Vocal Training', 'vocal-training', 'Breath control, pitch accuracy, vocal range expansion, and resonance')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

WITH cat AS (SELECT id FROM public.skill_categories WHERE slug = 'business-marketing')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat.id, s.name, s.slug, s.description
FROM cat, (VALUES
    ('Search Engine Optimization (SEO)', 'seo', 'Keyword research, on-page optimization, and technical SEO'),
    ('Content Marketing & Copywriting', 'copywriting', 'Engaging headline writing, email copy, and storytelling for brands'),
    ('Product Management', 'product-management', 'Agile sprints, user stories, roadmapping, and MVP prioritization')
) AS s(name, slug, description)
ON CONFLICT (name) DO NOTHING;

WITH cat_culinary AS (SELECT id FROM public.skill_categories WHERE slug = 'culinary-arts'),
     cat_fitness AS (SELECT id FROM public.skill_categories WHERE slug = 'health-fitness')
INSERT INTO public.skills (category_id, name, slug, description)
SELECT cat_culinary.id, 'Artisan Bread Baking', 'bread-baking', 'Sourdough starter maintenance, fermentation, and shaping'
FROM cat_culinary
UNION ALL
SELECT cat_fitness.id, 'Vinyasa Yoga', 'vinyasa-yoga', 'Asana flows, alignment, breath connection, and flexibility'
FROM cat_fitness
ON CONFLICT (name) DO NOTHING;
