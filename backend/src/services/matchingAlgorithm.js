/**
 * SkillSwap Intelligent Matching Algorithm
 * 
 * Normalized 4-Factor Weighted Model:
 *  - 50% Skill Compatibility (Bilateral reciprocity & proficiency fit)
 *  - 25% Availability Overlap (Day-of-week & time interval intersection)
 *  - 15% Shared Interests (Jaccard similarity on topic tags)
 *  - 10% Reliability Score (Verified reviews, swap completion track record)
 * 
 * All component scores are strictly normalized between 0 and 100.
 */

const PROFICIENCY_RANK = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * 1. Skill Compatibility (0 - 100, 50% weight)
 */
export function calculateSkillCompatibility(
  userWanted = [],
  userTeaching = [],
  candidateTeaching = [],
  candidateWanted = []
) {
  // Forward: What candidate teaches that user wants
  const forwardMatches = [];
  userWanted.forEach((uw) => {
    const uwSkillId = uw.skill_id || uw.skills?.id;
    const match = candidateTeaching.find(
      (ct) => (ct.skill_id || ct.skills?.id) === uwSkillId
    );
    if (match) {
      const teacherLevel = PROFICIENCY_RANK[match.proficiency_level] || 2;
      const targetLevel = PROFICIENCY_RANK[uw.target_proficiency] || 1;
      const profFit = Math.min(1.0, teacherLevel / targetLevel);
      forwardMatches.push({
        skillId: uwSkillId,
        skillName: match.skills?.name || uw.skills?.name || 'Skill',
        teacherLevel: match.proficiency_level,
        targetLevel: uw.target_proficiency,
        priority: uw.priority || 'medium',
        profFit,
      });
    }
  });

  // Reciprocal: What user teaches that candidate wants
  const reciprocalMatches = [];
  candidateWanted.forEach((cw) => {
    const cwSkillId = cw.skill_id || cw.skills?.id;
    const match = userTeaching.find(
      (ut) => (ut.skill_id || ut.skills?.id) === cwSkillId
    );
    if (match) {
      const teacherLevel = PROFICIENCY_RANK[match.proficiency_level] || 2;
      const targetLevel = PROFICIENCY_RANK[cw.target_proficiency] || 1;
      const profFit = Math.min(1.0, teacherLevel / targetLevel);
      reciprocalMatches.push({
        skillId: cwSkillId,
        skillName: match.skills?.name || cw.skills?.name || 'Skill',
        teacherLevel: match.proficiency_level,
        targetLevel: cw.target_proficiency,
        priority: cw.priority || 'medium',
        profFit,
      });
    }
  });

  let skillScore = 0;
  let matchType = 'none';

  // Bilateral Reciprocal Match
  if (forwardMatches.length > 0 && reciprocalMatches.length > 0) {
    matchType = 'perfect_reciprocal';
    const avgForwardFit =
      forwardMatches.reduce((s, m) => s + m.profFit, 0) / forwardMatches.length;
    const avgReciprocalFit =
      reciprocalMatches.reduce((s, m) => s + m.profFit, 0) / reciprocalMatches.length;
    const combinedFit = (avgForwardFit + avgReciprocalFit) / 2;

    // Base 85 + up to 15 for proficiency and multi-skill bonus
    const multiSkillBonus = Math.min(5, (forwardMatches.length + reciprocalMatches.length - 2) * 2.5);
    skillScore = Math.min(100, Math.round(85 + combinedFit * 10 + multiSkillBonus));
  }
  // One-way: Candidate teaches what user wants
  else if (forwardMatches.length > 0) {
    matchType = 'one_way_offering';
    const avgForwardFit =
      forwardMatches.reduce((s, m) => s + m.profFit, 0) / forwardMatches.length;
    const hasHighPriority = forwardMatches.some((m) => m.priority === 'high');
    skillScore = Math.min(70, Math.round(50 + avgForwardFit * 15 + (hasHighPriority ? 5 : 0)));
  }
  // One-way: User teaches what candidate wants
  else if (reciprocalMatches.length > 0) {
    matchType = 'one_way_seeking';
    const avgReciprocalFit =
      reciprocalMatches.reduce((s, m) => s + m.profFit, 0) / reciprocalMatches.length;
    skillScore = Math.min(45, Math.round(35 + avgReciprocalFit * 10));
  }
  // Category-level affinity fallback
  else {
    const userWantedCategories = new Set(
      userWanted.map((w) => w.skills?.category_id).filter(Boolean)
    );
    const candidateTeachingCategories = new Set(
      candidateTeaching.map((t) => t.skills?.category_id).filter(Boolean)
    );

    let sharedCategoriesCount = 0;
    userWantedCategories.forEach((catId) => {
      if (candidateTeachingCategories.has(catId)) sharedCategoriesCount++;
    });

    if (sharedCategoriesCount > 0) {
      matchType = 'category_affinity';
      skillScore = Math.min(25, sharedCategoriesCount * 15);
    }
  }

  return {
    score: Math.max(0, Math.min(100, skillScore)),
    matchType,
    forwardMatches,
    reciprocalMatches,
  };
}

/**
 * Helper to parse "HH:MM" or "HH:MM:SS" into minutes from midnight
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

/**
 * 2. Availability Overlap (0 - 100, 25% weight)
 */
export function calculateAvailabilityOverlap(
  userSlots = [],
  candidateSlots = [],
  userMode = 'flexible',
  candidateMode = 'flexible'
) {
  // If neither has availability records, provide neutral score
  if (!userSlots.length || !candidateSlots.length) {
    return {
      score: 40,
      overlappingDays: [],
      totalOverlapHours: 0,
      hasOverlap: false,
    };
  }

  const overlappingDays = [];
  let totalOverlapMinutes = 0;
  let matchingDaysCount = 0;

  userSlots.forEach((uSlot) => {
    const matchingCandSlots = candidateSlots.filter(
      (cSlot) => cSlot.day_of_week === uSlot.day_of_week
    );

    if (matchingCandSlots.length > 0) {
      matchingDaysCount++;
      const uStart = parseTimeToMinutes(uSlot.start_time);
      const uEnd = parseTimeToMinutes(uSlot.end_time);

      matchingCandSlots.forEach((cSlot) => {
        const cStart = parseTimeToMinutes(cSlot.start_time);
        const cEnd = parseTimeToMinutes(cSlot.end_time);

        const overlapStart = Math.max(uStart, cStart);
        const overlapEnd = Math.min(uEnd, cEnd);

        if (overlapEnd > overlapStart) {
          const mins = overlapEnd - overlapStart;
          totalOverlapMinutes += mins;
          const dayName = DAY_NAMES[uSlot.day_of_week];
          if (!overlappingDays.some((d) => d.dayName === dayName)) {
            overlappingDays.push({
              dayOfWeek: uSlot.day_of_week,
              dayName,
              startMinutes: overlapStart,
              endMinutes: overlapEnd,
              hours: Number((mins / 60).toFixed(1)),
            });
          }
        }
      });
    }
  });

  const totalOverlapHours = Number((totalOverlapMinutes / 60).toFixed(1));
  let availScore = 0;

  if (overlappingDays.length >= 3 || totalOverlapHours >= 6) {
    availScore = 100;
  } else if (totalOverlapHours > 0) {
    availScore = Math.min(100, Math.round(overlappingDays.length * 25 + totalOverlapHours * 8));
  } else if (matchingDaysCount > 0) {
    // Shared days, but times don't strictly intersect
    availScore = Math.min(45, matchingDaysCount * 15);
  }

  // Flexible learning mode bonus
  if (userMode === 'flexible' || candidateMode === 'flexible') {
    availScore = Math.min(100, availScore + 10);
  }

  return {
    score: Math.max(0, Math.min(100, availScore)),
    overlappingDays,
    totalOverlapHours,
    hasOverlap: totalOverlapHours > 0 || matchingDaysCount > 0,
  };
}

/**
 * 3. Shared Interests (0 - 100, 15% weight)
 */
export function calculateSharedInterests(userInterests = [], candidateInterests = []) {
  const setA = new Set(userInterests.map((i) => (i.name || i).trim().toLowerCase()).filter(Boolean));
  const setB = new Set(candidateInterests.map((i) => (i.name || i).trim().toLowerCase()).filter(Boolean));

  if (!setA.size || !setB.size) {
    return { score: 0, sharedInterests: [], count: 0 };
  }

  const sharedInterests = [];
  setA.forEach((item) => {
    if (setB.has(item)) {
      // Find original capitalization
      const original =
        userInterests.find((i) => (i.name || i).toLowerCase() === item)?.name || item;
      sharedInterests.push(original);
    }
  });

  const count = sharedInterests.length;
  let interestScore = 0;

  if (count === 1) interestScore = 45;
  else if (count === 2) interestScore = 75;
  else if (count >= 3) interestScore = 100;

  return {
    score: interestScore,
    sharedInterests,
    count,
  };
}

/**
 * 4. Reliability Score (0 - 100, 10% weight)
 */
export function calculateReliabilityScore(profile = {}, completedSwapsCount = 0) {
  const ratingAvg = Number(profile.rating_avg) || 0;
  const ratingCount = Number(profile.rating_count) || 0;

  // Rating points: max 45
  const ratingPoints = ratingCount > 0 ? (ratingAvg / 5.0) * 45 : 35; // 35 default for new verified users

  // Rating count points: max 20
  const countPoints = Math.min(20, ratingCount * 2);

  // Completed swaps track record: max 25
  const swapPoints = Math.min(25, completedSwapsCount * 8);

  // Profile onboarding completion: 10 points
  const verifiedPoints = profile.onboarding_completed ? 10 : 0;

  const total = Math.round(ratingPoints + countPoints + swapPoints + verifiedPoints);
  return Math.max(0, Math.min(100, total));
}

/**
 * Generate human-readable explanation for why this match was recommended
 */
export function generateMatchExplanation({
  candidateName,
  matchType,
  forwardMatches = [],
  reciprocalMatches = [],
  overlappingDays = [],
  totalOverlapHours = 0,
  sharedInterests = [],
}) {
  const candidateFirst = candidateName ? candidateName.split(' ')[0] : 'This member';

  const offeredByThem = forwardMatches.map((m) => m.skillName);
  const offeredByYou = reciprocalMatches.map((m) => m.skillName);

  let explanation = '';

  if (matchType === 'perfect_reciprocal') {
    explanation = `✨ Perfect 2-Way Match! You teach ${offeredByYou.join(', ')} which ${candidateFirst} wants to learn, and ${candidateFirst} teaches ${offeredByThem.join(', ')} which is on your wishlist.`;
  } else if (matchType === 'one_way_offering') {
    explanation = `🎯 Direct Skill Opportunity: ${candidateFirst} teaches ${offeredByThem.join(', ')} which matches your current learning goals.`;
  } else if (matchType === 'one_way_seeking') {
    explanation = `🌱 Eager Learner: ${candidateFirst} is actively looking for someone to teach ${offeredByYou.join(', ')}.`;
  } else if (matchType === 'category_affinity') {
    explanation = `🤝 Category Affinity: ${candidateFirst} works in disciplines related to your learning interests.`;
  } else {
    explanation = `🌟 Community Member: Highly rated swapper in your extended network.`;
  }

  // Add availability details
  if (overlappingDays.length > 0) {
    const dayNames = overlappingDays.map((d) => d.dayName).join(', ');
    explanation += ` You have matching schedule availability on ${dayNames} (${totalOverlapHours} hrs overlap).`;
  }

  // Add shared interests details
  if (sharedInterests.length > 0) {
    explanation += ` You both share mutual interests in ${sharedInterests.join(' and ')}.`;
  }

  return explanation;
}

/**
 * Composite Evaluation of a Candidate against Current User
 */
export function evaluateMatch({
  user,
  userWanted = [],
  userTeaching = [],
  userInterests = [],
  userAvailability = [],
  candidate,
  candidateTeaching = [],
  candidateWanted = [],
  candidateInterests = [],
  candidateAvailability = [],
  candidateCompletedSwaps = 0,
}) {
  // 1. Skill Compatibility (50%)
  const skillResult = calculateSkillCompatibility(
    userWanted,
    userTeaching,
    candidateTeaching,
    candidateWanted
  );

  // 2. Availability Overlap (25%)
  const availResult = calculateAvailabilityOverlap(
    userAvailability,
    candidateAvailability,
    user.preferred_learning_mode,
    candidate.preferred_learning_mode
  );

  // 3. Shared Interests (15%)
  const interestResult = calculateSharedInterests(userInterests, candidateInterests);

  // 4. Reliability Score (10%)
  const reliabilityScore = calculateReliabilityScore(candidate, candidateCompletedSwaps);

  // 5. Final Normalized Weighted Composite Score (0 - 100)
  const compositeScore = Math.round(
    skillResult.score * 0.5 +
      availResult.score * 0.25 +
      interestResult.score * 0.15 +
      reliabilityScore * 0.1
  );

  const finalScore = Math.max(0, Math.min(100, compositeScore));

  // 6. Natural Language Explanation
  const explanation = generateMatchExplanation({
    candidateName: candidate.full_name,
    matchType: skillResult.matchType,
    forwardMatches: skillResult.forwardMatches,
    reciprocalMatches: skillResult.reciprocalMatches,
    overlappingDays: availResult.overlappingDays,
    totalOverlapHours: availResult.totalOverlapHours,
    sharedInterests: interestResult.sharedInterests,
  });

  return {
    candidateId: candidate.id,
    compatibilityScore: finalScore,
    matchType: skillResult.matchType,
    breakdown: {
      skillScore: skillResult.score,
      skillWeight: '50%',
      availabilityScore: availResult.score,
      availabilityWeight: '25%',
      interestScore: interestResult.score,
      interestWeight: '15%',
      reliabilityScore,
      reliabilityWeight: '10%',
    },
    forwardMatches: skillResult.forwardMatches,
    reciprocalMatches: skillResult.reciprocalMatches,
    overlappingDays: availResult.overlappingDays,
    totalOverlapHours: availResult.totalOverlapHours,
    sharedInterests: interestResult.sharedInterests,
    explanation,
  };
}
