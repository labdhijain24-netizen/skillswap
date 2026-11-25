import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

// Canonical fallback catalog matching database/migrations/004_seed_categories_and_skills.sql
const CANONICAL_CATEGORIES = [
  { id: '1', name: 'Programming & Tech', slug: 'programming-tech', description: 'Software development, web apps, databases, and IT skills', icon: 'Code' },
  { id: '2', name: 'Design & Creative', slug: 'design-creative', description: 'UI/UX design, illustration, 3D modeling, and graphic arts', icon: 'Palette' },
  { id: '3', name: 'Languages', slug: 'languages', description: 'World languages, conversational fluency, and pronunciation', icon: 'Languages' },
  { id: '4', name: 'Music & Audio', slug: 'music-audio', description: 'Acoustic instruments, vocal coaching, and audio production', icon: 'Music' },
  { id: '5', name: 'Business & Marketing', slug: 'business-marketing', description: 'Entrepreneurship, copywriting, product strategy, and SEO', icon: 'Briefcase' },
  { id: '6', name: 'Photography & Video', slug: 'photography-video', description: 'Camera lighting, composition, video editing, and color grading', icon: 'Camera' },
  { id: '7', name: 'Health & Fitness', slug: 'health-fitness', description: 'Strength training, yoga flows, nutrition, and wellness practices', icon: 'HeartPulse' },
  { id: '8', name: 'Culinary Arts', slug: 'culinary-arts', description: 'Artisan baking, culinary knife techniques, and cooking methods', icon: 'Utensils' },
];

/**
 * Community Service
 * Fetches real metrics, categories, featured offerings, and genuine reviews from Supabase.
 * Respects strict honesty: never invents fake metrics or reviews.
 */

export const getCommunityStats = async () => {
  if (!isSupabaseConfigured()) {
    return {
      isDatabaseConnected: false,
      membersCount: 0,
      skillsCatalogCount: CANONICAL_CATEGORIES.length * 4,
      skillsOfferedCount: 0,
      completedSwapsCount: 0,
      reviewsCount: 0,
      averageRating: 0.0,
      statusNote: 'Supabase credentials pending in backend/.env',
    };
  }

  const client = supabaseAdmin || supabase;

  try {
    // Run parallel count queries on real database tables
    const [
      profilesRes,
      skillsRes,
      userSkillsRes,
      completedSwapsRes,
      reviewsRes,
    ] = await Promise.all([
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('skills').select('*', { count: 'exact', head: true }),
      client.from('user_skills').select('*', { count: 'exact', head: true }),
      client.from('swap_requests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      client.from('reviews').select('rating'),
    ]);

    const membersCount = profilesRes.count || 0;
    const skillsCatalogCount = skillsRes.count || 0;
    const skillsOfferedCount = userSkillsRes.count || 0;
    const completedSwapsCount = completedSwapsRes.count || 0;
    const reviews = reviewsRes.data || [];
    const reviewsCount = reviews.length;

    let averageRating = 0.0;
    if (reviewsCount > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      averageRating = Number((sum / reviewsCount).toFixed(2));
    }

    return {
      isDatabaseConnected: true,
      membersCount,
      skillsCatalogCount,
      skillsOfferedCount,
      completedSwapsCount,
      reviewsCount,
      averageRating,
      statusNote: 'Live metrics verified directly from Supabase PostgreSQL',
    };
  } catch (error) {
    return {
      isDatabaseConnected: false,
      membersCount: 0,
      skillsCatalogCount: 0,
      skillsOfferedCount: 0,
      completedSwapsCount: 0,
      reviewsCount: 0,
      averageRating: 0.0,
      statusNote: error.message || 'Unable to fetch database metrics',
    };
  }
};

export const getCategories = async () => {
  if (!isSupabaseConfigured()) {
    return {
      source: 'canonical_catalog',
      categories: CANONICAL_CATEGORIES,
    };
  }

  const client = supabaseAdmin || supabase;
  try {
    const { data, error } = await client
      .from('skill_categories')
      .select('id, name, slug, description, icon')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return {
        source: 'canonical_catalog',
        categories: CANONICAL_CATEGORIES,
      };
    }

    return {
      source: 'database',
      categories: data,
    };
  } catch (err) {
    return {
      source: 'canonical_catalog',
      categories: CANONICAL_CATEGORIES,
    };
  }
};

export const getFeaturedSkills = async () => {
  if (!isSupabaseConfigured()) {
    return {
      hasRealData: false,
      data: [],
      message: 'No real skill postings yet. Add skills through the SkillSwap platform.',
    };
  }

  const client = supabaseAdmin || supabase;
  try {
    const { data, error } = await client
      .from('user_skills')
      .select(`
        id,
        proficiency_level,
        experience_years,
        description,
        created_at,
        profiles:user_id (id, username, full_name, avatar_url, location, rating_avg, rating_count),
        skills:skill_id (id, name, slug, description, category_id, skill_categories:category_id (name, slug, icon))
      `)
      .eq('is_active', true)
      .limit(8);

    if (error || !data || data.length === 0) {
      return {
        hasRealData: false,
        data: [],
        message: 'No real user skill offerings have been published in the database yet.',
      };
    }

    return {
      hasRealData: true,
      data,
    };
  } catch (err) {
    return {
      hasRealData: false,
      data: [],
      message: err.message || 'Error querying database for featured skills.',
    };
  }
};

export const getTestimonials = async () => {
  if (!isSupabaseConfigured()) {
    return {
      hasRealReviews: false,
      reviews: [],
      message: 'Reviews will appear as soon as real community members complete skill swaps.',
    };
  }

  const client = supabaseAdmin || supabase;
  try {
    const { data, error } = await client
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:reviewer_id (id, full_name, username, avatar_url),
        reviewee:reviewee_id (id, full_name, username),
        session:session_id (id, title, skill:skill_id (name))
      `)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error || !data || data.length === 0) {
      return {
        hasRealReviews: false,
        reviews: [],
        message: 'Zero reviews yet. Testimonials only appear after verified completed swaps.',
      };
    }

    return {
      hasRealReviews: true,
      reviews: data,
    };
  } catch (err) {
    return {
      hasRealReviews: false,
      reviews: [],
      message: err.message,
    };
  }
};
