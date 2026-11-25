import { supabase, isSupabaseConfigured } from '../config/db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { evaluateMatch } from './matchingAlgorithm.js';

/**
 * Fetch all matching data for a user and rank candidate matches
 * Directly queries real PostgreSQL relational records.
 */
export async function getMatchesForUser(userId, options = {}) {
  const { limit = 10, minScore = 15 } = options;
  const client = supabaseAdmin || supabase;

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase PostgreSQL database is not configured');
  }

  // 1. Fetch current user full relational context
  const [userProfileRes, userTeachingRes, userWantedRes, userInterestsRes, userAvailRes] =
    await Promise.all([
      client.from('profiles').select('*').eq('id', userId).single(),
      client
        .from('user_skills')
        .select('id, skill_id, proficiency_level, experience_years, description, skills (id, name, slug, category_id)')
        .eq('user_id', userId)
        .eq('is_active', true),
      client
        .from('wanted_skills')
        .select('id, skill_id, target_proficiency, priority, notes, skills (id, name, slug, category_id)')
        .eq('user_id', userId),
      client.from('user_interests').select('id, name').eq('user_id', userId),
      client.from('availability').select('*').eq('user_id', userId).eq('is_active', true),
    ]);

  if (!userProfileRes.data) {
    throw new Error(`User with ID ${userId} was not found in profiles.`);
  }

  const currentUser = userProfileRes.data;
  const userTeaching = userTeachingRes.data || [];
  const userWanted = userWantedRes.data || [];
  const userInterests = userInterestsRes.data || [];
  const userAvailability = userAvailRes.data || [];

  // 2. Fetch all other active candidate profiles
  const { data: candidates, error: candError } = await client
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, location, time_zone, preferred_learning_mode, rating_avg, rating_count, onboarding_completed')
    .neq('id', userId)
    .eq('is_active', true);

  if (candError) throw candError;
  if (!candidates || candidates.length === 0) return [];

  const candidateIds = candidates.map((c) => c.id);

  // 3. Fetch relational data for all candidates in parallel
  const [
    candTeachingRes,
    candWantedRes,
    candInterestsRes,
    candAvailRes,
    completedSwapsRes,
  ] = await Promise.all([
    client
      .from('user_skills')
      .select('id, user_id, skill_id, proficiency_level, experience_years, description, skills (id, name, slug, category_id, skill_categories (name))')
      .in('user_id', candidateIds)
      .eq('is_active', true),
    client
      .from('wanted_skills')
      .select('id, user_id, skill_id, target_proficiency, priority, notes, skills (id, name, slug, category_id, skill_categories (name))')
      .in('user_id', candidateIds),
    client.from('user_interests').select('id, user_id, name').in('user_id', candidateIds),
    client.from('availability').select('*').in('user_id', candidateIds).eq('is_active', true),
    client
      .from('swap_requests')
      .select('id, sender_id, receiver_id')
      .eq('status', 'completed')
      .or(`sender_id.in.(${candidateIds.join(',')}),receiver_id.in.(${candidateIds.join(',')})`),
  ]);

  // Group candidate data by user_id
  const candTeachingMap = {};
  const candWantedMap = {};
  const candInterestsMap = {};
  const candAvailMap = {};
  const candCompletedSwapsCount = {};

  candidateIds.forEach((id) => {
    candTeachingMap[id] = [];
    candWantedMap[id] = [];
    candInterestsMap[id] = [];
    candAvailMap[id] = [];
    candCompletedSwapsCount[id] = 0;
  });

  (candTeachingRes.data || []).forEach((row) => {
    if (candTeachingMap[row.user_id]) candTeachingMap[row.user_id].push(row);
  });

  (candWantedRes.data || []).forEach((row) => {
    if (candWantedMap[row.user_id]) candWantedMap[row.user_id].push(row);
  });

  (candInterestsRes.data || []).forEach((row) => {
    if (candInterestsMap[row.user_id]) candInterestsMap[row.user_id].push(row);
  });

  (candAvailRes.data || []).forEach((row) => {
    if (candAvailMap[row.user_id]) candAvailMap[row.user_id].push(row);
  });

  (completedSwapsRes.data || []).forEach((swap) => {
    if (candCompletedSwapsCount[swap.sender_id] !== undefined) {
      candCompletedSwapsCount[swap.sender_id]++;
    }
    if (candCompletedSwapsCount[swap.receiver_id] !== undefined) {
      candCompletedSwapsCount[swap.receiver_id]++;
    }
  });

  // 4. Run matching algorithm on every candidate
  const evaluatedMatches = [];

  for (const candidate of candidates) {
    const candidateTeaching = candTeachingMap[candidate.id] || [];
    const candidateWanted = candWantedMap[candidate.id] || [];
    const candidateInterests = candInterestsMap[candidate.id] || [];
    const candidateAvailability = candAvailMap[candidate.id] || [];
    const candidateCompletedSwaps = candCompletedSwapsCount[candidate.id] || 0;

    const matchResult = evaluateMatch({
      user: currentUser,
      userWanted,
      userTeaching,
      userInterests,
      userAvailability,
      candidate,
      candidateTeaching,
      candidateWanted,
      candidateInterests,
      candidateAvailability,
      candidateCompletedSwaps,
    });

    if (matchResult.compatibilityScore >= minScore) {
      evaluatedMatches.push({
        candidate,
        compatibilityScore: matchResult.compatibilityScore,
        matchType: matchResult.matchType,
        breakdown: matchResult.breakdown,
        forwardMatches: matchResult.forwardMatches,
        reciprocalMatches: matchResult.reciprocalMatches,
        overlappingDays: matchResult.overlappingDays,
        totalOverlapHours: matchResult.totalOverlapHours,
        sharedInterests: matchResult.sharedInterests,
        explanation: matchResult.explanation,
        // Candidate profile snapshot for instant rendering
        teachingSkills: candidateTeaching,
        wantedSkills: candidateWanted,
      });
    }
  }

  // 5. Sort candidates by compatibility score descending, then skill score descending
  evaluatedMatches.sort((a, b) => {
    if (b.compatibilityScore !== a.compatibilityScore) {
      return b.compatibilityScore - a.compatibilityScore;
    }
    return b.breakdown.skillScore - a.breakdown.skillScore;
  });

  // 6. Slice to requested limit
  const topMatches = evaluatedMatches.slice(0, limit);

  // 7. Persist or update top bilateral matches into 'matches' table
  for (const match of topMatches) {
    if (match.matchType === 'perfect_reciprocal' && match.forwardMatches.length > 0 && match.reciprocalMatches.length > 0) {
      const uA = userId < match.candidate.id ? userId : match.candidate.id;
      const uB = userId < match.candidate.id ? match.candidate.id : userId;
      const uASkill = userId < match.candidate.id ? match.reciprocalMatches[0].skillId : match.forwardMatches[0].skillId;
      const uBSkill = userId < match.candidate.id ? match.forwardMatches[0].skillId : match.reciprocalMatches[0].skillId;

      if (uASkill && uBSkill) {
        try {
          await client.from('matches').upsert(
            {
              user_a_id: uA,
              user_b_id: uB,
              user_a_skill_id: uASkill,
              user_b_skill_id: uBSkill,
              compatibility_score: match.compatibilityScore,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_a_id,user_b_id,user_a_skill_id,user_b_skill_id' }
          );
        } catch {
          // Ignore unique conflict or minor RLS restriction in user context
        }
      }
    }
  }

  return topMatches;
}
