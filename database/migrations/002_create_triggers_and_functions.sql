-- ============================================================================
-- SkillSwap Migration 002: Triggers & Database Functions
-- Automated updated_at timestamps, new user profile creation & rating calculation
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Automatic updated_at timestamp trigger function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger across all applicable tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_skill_categories_updated_at ON public.skill_categories;
CREATE TRIGGER trg_skill_categories_updated_at
    BEFORE UPDATE ON public.skill_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_skills_updated_at ON public.skills;
CREATE TRIGGER trg_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_user_skills_updated_at ON public.user_skills;
CREATE TRIGGER trg_user_skills_updated_at
    BEFORE UPDATE ON public.user_skills
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_wanted_skills_updated_at ON public.wanted_skills;
CREATE TRIGGER trg_wanted_skills_updated_at
    BEFORE UPDATE ON public.wanted_skills
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_availability_updated_at ON public.availability;
CREATE TRIGGER trg_availability_updated_at
    BEFORE UPDATE ON public.availability
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_swap_requests_updated_at ON public.swap_requests;
CREATE TRIGGER trg_swap_requests_updated_at
    BEFORE UPDATE ON public.swap_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_matches_updated_at ON public.matches;
CREATE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_sessions_updated_at ON public.sessions;
CREATE TRIGGER trg_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Automatic Profile Creation on Supabase Auth Signup
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_username TEXT;
    clean_username TEXT;
    raw_full_name TEXT;
BEGIN
    -- Extract username from metadata or email prefix
    raw_username := NEW.raw_user_meta_data->>'username';
    IF raw_username IS NULL OR raw_username = '' THEN
        raw_username := split_part(NEW.email, '@', 1);
    END IF;

    -- Ensure uniqueness by appending 4 random digits if duplicate
    clean_username := lower(regexp_replace(raw_username, '[^a-zA-Z0-9_]', '', 'g'));
    IF clean_username = '' THEN
        clean_username := 'user_' || substr(NEW.id::text, 1, 6);
    END IF;

    raw_full_name := NEW.raw_user_meta_data->>'full_name';
    IF raw_full_name IS NULL OR raw_full_name = '' THEN
        raw_full_name := clean_username;
    END IF;

    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        avatar_url,
        bio
    ) VALUES (
        NEW.id,
        clean_username,
        raw_full_name,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'bio'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute upon auth.users insertion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. Automatic Profile Rating Recalculation after Reviews
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_review_rating_update()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    new_avg NUMERIC(3, 2);
    new_count INTEGER;
BEGIN
    target_user_id := COALESCE(NEW.reviewee_id, OLD.reviewee_id);

    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00),
        COUNT(*)
    INTO 
        new_avg, 
        new_count
    FROM public.reviews
    WHERE reviewee_id = target_user_id;

    UPDATE public.profiles
    SET 
        rating_avg = new_avg,
        rating_count = new_count,
        updated_at = NOW()
    WHERE id = target_user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_rating_on_review ON public.reviews;
CREATE TRIGGER trg_update_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_review_rating_update();

-- ----------------------------------------------------------------------------
-- 4. Automatic Conversation Last Message Timestamp Update
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_message_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_conv_on_message ON public.messages;
CREATE TRIGGER trg_update_conv_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_message_conversation_timestamp();
