import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { evaluateMatch } from './matchingAlgorithm.js';

/**
 * Explore Skills Service
 * Fetches real user skill offerings with rich filtering, search, and sorting.
 */
export async function getExploreSkills(query = {}) {
  const {
    search = '',
    category = 'all',
    proficiency = 'all',
    availability = 'all',
    sort = 'recent',
    userId = null,
    limit = 24,
    offset = 0,
  } = query;

  const client = supabaseAdmin || supabase;
  if (!isSupabaseConfigured()) {
    return { data: [], total: 0, hasRealData: false };
  }

  // 1. Build base query joining user_skills with skills, categories, profiles, and availability
  let baseQuery = client
    .from('user_skills')
    .select(`
      id,
      proficiency_level,
      experience_years,
      description,
      created_at,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        time_zone,
        preferred_learning_mode,
        rating_avg,
        rating_count,
        onboarding_completed
      ),
      skills:skill_id (
        id,
        name,
        slug,
        description,
        category_id,
        skill_categories:category_id (
          id,
          name,
          slug,
          icon
        )
      )
    `)
    .eq('is_active', true);

  // Exclude current user from explore search results if requested
  if (userId) {
    baseQuery = baseQuery.neq('user_id', userId);
  }

  // Filter: Proficiency
  if (proficiency && proficiency !== 'all') {
    baseQuery = baseQuery.eq('proficiency_level', proficiency.toLowerCase());
  }

  const { data: rawSkills, error } = await baseQuery;
  if (error) throw error;
  if (!rawSkills || rawSkills.length === 0) {
    return { data: [], total: 0, hasRealData: false };
  }

  // Collect unique teacher IDs to fetch their wanted skills and availability
  const teacherIds = [...new Set(rawSkills.map((s) => s.profiles?.id).filter(Boolean))];

  const [wantedRes, availRes] = await Promise.all([
    client
      .from('wanted_skills')
      .select('user_id, skills (id, name, slug)')
      .in('user_id', teacherIds),
    client
      .from('availability')
      .select('user_id, day_of_week, start_time, end_time')
      .in('user_id', teacherIds)
      .eq('is_active', true),
  ]);

  const teacherWantedMap = {};
  const teacherAvailMap = {};

  teacherIds.forEach((id) => {
    teacherWantedMap[id] = [];
    teacherAvailMap[id] = [];
  });

  (wantedRes.data || []).forEach((w) => {
    if (w.skills?.name && teacherWantedMap[w.user_id]) {
      teacherWantedMap[w.user_id].push(w.skills.name);
    }
  });

  (availRes.data || []).forEach((a) => {
    if (teacherAvailMap[a.user_id]) {
      teacherAvailMap[a.user_id].push(a);
    }
  });

  // Map into rich client-ready objects
  let items = rawSkills.map((item) => {
    const teacher = item.profiles || {};
    const skill = item.skills || {};
    const categoryInfo = skill.skill_categories || {};
    const teacherAvail = teacherAvailMap[teacher.id] || [];
    const wantsInReturn = teacherWantedMap[teacher.id] || [];

    // Derive active days
    const activeDays = [...new Set(teacherAvail.map((a) => a.day_of_week))];

    return {
      id: item.id,
      title: skill.name || 'Skill',
      slug: skill.slug,
      skillId: skill.id,
      category: categoryInfo.name || 'General',
      categorySlug: categoryInfo.slug || 'general',
      categoryIcon: categoryInfo.icon || 'Sparkles',
      proficiency: item.proficiency_level,
      experienceYears: Number(item.experience_years) || 1,
      description: item.description || skill.description || '',
      createdAt: item.created_at,
      wantsInReturn,
      availabilitySlots: teacherAvail,
      activeDays,
      teacher: {
        id: teacher.id,
        username: teacher.username,
        name: teacher.full_name,
        avatar: teacher.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        rating: Number(teacher.rating_avg) || 5.0,
        reviewCount: teacher.rating_count || 0,
        location: teacher.location || '',
        learningMode: teacher.preferred_learning_mode || 'flexible',
      },
      compatibilityScore: null,
    };
  });

  // 2. In-memory Filter: Category
  if (category && category !== 'all') {
    items = items.filter(
      (item) => item.categorySlug === category || item.category.toLowerCase() === category.toLowerCase()
    );
  }

  // 3. In-memory Filter: Search
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.teacher.name.toLowerCase().includes(q) ||
        item.teacher.username.toLowerCase().includes(q) ||
        item.wantsInReturn.some((w) => w.toLowerCase().includes(q))
    );
  }

  // 4. In-memory Filter: Availability
  if (availability && availability !== 'all') {
    const availFilter = availability.toLowerCase();
    items = items.filter((item) => {
      const days = item.activeDays || [];
      if (availFilter === 'weekday') {
        return days.some((d) => d >= 1 && d <= 5);
      }
      if (availFilter === 'weekend') {
        return days.some((d) => d === 0 || d === 6);
      }
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      if (dayMap[availFilter] !== undefined) {
        return days.includes(dayMap[availFilter]);
      }
      return true;
    });
  }

  // 5. If user is authenticated and sort is 'recommended', calculate compatibility score
  if (userId) {
    try {
      // Fetch user profile and relations to compute match score
      const [uProf, uTeach, uWant, uInt, uAvail] = await Promise.all([
        client.from('profiles').select('*').eq('id', userId).single(),
        client.from('user_skills').select('*, skills(*)').eq('user_id', userId),
        client.from('wanted_skills').select('*, skills(*)').eq('user_id', userId),
        client.from('user_interests').select('*').eq('user_id', userId),
        client.from('availability').select('*').eq('user_id', userId),
      ]);

      if (uProf.data) {
        items.forEach((item) => {
          const evalRes = evaluateMatch({
            user: uProf.data,
            userWanted: uWant.data || [],
            userTeaching: uTeach.data || [],
            userInterests: uInt.data || [],
            userAvailability: uAvail.data || [],
            candidate: item.teacher,
            candidateTeaching: [{ skill_id: item.skillId, proficiency_level: item.proficiency, skills: { id: item.skillId, name: item.title, category_id: item.categoryId } }],
            candidateWanted: item.wantsInReturn.map((name) => ({ skills: { name } })),
            candidateInterests: [],
            candidateAvailability: item.availabilitySlots,
            candidateCompletedSwaps: 1,
          });
          item.compatibilityScore = evalRes.compatibilityScore;
          item.matchExplanation = evalRes.explanation;
        });
      }
    } catch {
      // Fallback gracefully
    }
  }

  // 6. Sorting
  items.sort((a, b) => {
    if (sort === 'recommended' && a.compatibilityScore !== null && b.compatibilityScore !== null) {
      return b.compatibilityScore - a.compatibilityScore;
    }
    if (sort === 'rating') {
      return b.teacher.rating - a.teacher.rating || b.teacher.reviewCount - a.teacher.reviewCount;
    }
    if (sort === 'experience') {
      return b.experienceYears - a.experienceYears;
    }
    if (sort === 'name') {
      return a.title.localeCompare(b.title);
    }
    // Default: 'recent'
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const total = items.length;
  const paginated = items.slice(offset, offset + limit);

  return {
    data: paginated,
    total,
    hasRealData: total > 0,
  };
}
