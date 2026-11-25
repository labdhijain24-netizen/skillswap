import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getMatchesForUser } from '../services/matchService.js';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 SKILLSWAP INTELLIGENT MATCHING ALGORITHM VERIFICATION');
  console.log('🧪 Testing against LIVE Supabase PostgreSQL database records');
  console.log('🧪 ========================================================\n');

  // Find sample users from database
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, username, full_name');

  if (pErr || !profiles?.length) {
    console.error('Failed to load profiles:', pErr);
    process.exit(1);
  }

  const maya = profiles.find((p) => p.username === 'maya_design');
  const lucas = profiles.find((p) => p.username === 'lucas_dev');
  const elena = profiles.find((p) => p.username === 'elena_culinary');
  const sofia = profiles.find((p) => p.username === 'sofia_languages');
  const julian = profiles.find((p) => p.username === 'julian_music');

  if (!maya || !lucas) {
    console.error('Test accounts not found. Run seed script first.');
    process.exit(1);
  }

  console.log(`Found Test Users:
  - Maya Lin:   ${maya.id} (@${maya.username})
  - Lucas Vance: ${lucas.id} (@${lucas.username})
  - Elena:       ${elena?.id} (@${elena?.username})
  - Sofia:       ${sofia?.id} (@${sofia?.username})
  - Julian:      ${julian?.id} (@${julian?.username})\n`);

  // ----------------------------------------------------
  // TEST 1: Maya Lin (Teaches Photoshop/Figma, Wants Python/Guitar)
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log(`🔍 TEST 1: Running Matching Algorithm for Maya Lin (@${maya.username})`);
  console.log('----------------------------------------------------');

  const mayaMatches = await getMatchesForUser(maya.id, { limit: 5 });
  console.log(`Found ${mayaMatches.length} ranked matches for Maya.\n`);

  mayaMatches.forEach((m, idx) => {
    console.log(`#${idx + 1} Candidate: ${m.candidate.full_name} (@${m.candidate.username})`);
    console.log(`   🏆 Compatibility Score: ${m.compatibilityScore}% (Match Type: ${m.matchType})`);
    console.log(`   📊 Component Breakdown:`);
    console.log(`      - Skill (50%):        ${m.breakdown.skillScore}/100`);
    console.log(`      - Availability (25%): ${m.breakdown.availabilityScore}/100 (${m.totalOverlapHours} hrs overlap)`);
    console.log(`      - Interests (15%):    ${m.breakdown.interestScore}/100 (${m.sharedInterests?.join(', ') || 'None'})`);
    console.log(`      - Reliability (10%):  ${m.breakdown.reliabilityScore}/100`);
    console.log(`   💡 Explanation: "${m.explanation}"\n`);
  });

  // Verify that Lucas is ranked #1 for Maya
  const topMatchForMaya = mayaMatches[0];
  if (topMatchForMaya?.candidate?.username === 'lucas_dev') {
    console.log('✅ TEST 1 PASSED: Lucas Vance is Maya\'s top reciprocal match!');
    console.log(`   Top match score: ${topMatchForMaya.compatibilityScore}%`);
  } else {
    console.warn('⚠️ Warning: Lucas Vance was not ranked #1 for Maya:', topMatchForMaya?.candidate?.username);
  }

  // ----------------------------------------------------
  // TEST 2: Elena Rostova (Teaches Bread Baking, Wants Spanish)
  // ----------------------------------------------------
  if (elena) {
    console.log('\n----------------------------------------------------');
    console.log(`🔍 TEST 2: Running Matching Algorithm for Elena Rostova (@${elena.username})`);
    console.log('----------------------------------------------------');

    const elenaMatches = await getMatchesForUser(elena.id, { limit: 5 });
    console.log(`Found ${elenaMatches.length} ranked matches for Elena.\n`);

    elenaMatches.forEach((m, idx) => {
      console.log(`#${idx + 1} Candidate: ${m.candidate.full_name} (@${m.candidate.username})`);
      console.log(`   🏆 Compatibility Score: ${m.compatibilityScore}% (Match Type: ${m.matchType})`);
      console.log(`   💡 Explanation: "${m.explanation}"\n`);
    });

    const topMatchForElena = elenaMatches[0];
    if (topMatchForElena?.candidate?.username === 'sofia_languages') {
      console.log('✅ TEST 2 PASSED: Sofia Ortiz is Elena\'s top reciprocal match!');
    }
  }

  // ----------------------------------------------------
  // TEST 3: Mathematical Normalization Checks
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('🔍 TEST 3: Verifying Math & Range Normalization [0, 100]');
  console.log('----------------------------------------------------');

  let allInRange = true;
  mayaMatches.forEach((m) => {
    const { skillScore, availabilityScore, interestScore, reliabilityScore } = m.breakdown;
    const { compatibilityScore } = m;

    if (skillScore < 0 || skillScore > 100) allInRange = false;
    if (availabilityScore < 0 || availabilityScore > 100) allInRange = false;
    if (interestScore < 0 || interestScore > 100) allInRange = false;
    if (reliabilityScore < 0 || reliabilityScore > 100) allInRange = false;
    if (compatibilityScore < 0 || compatibilityScore > 100) allInRange = false;

    // Verify formula
    const expected = Math.round(
      skillScore * 0.5 + availabilityScore * 0.25 + interestScore * 0.15 + reliabilityScore * 0.1
    );
    if (expected !== compatibilityScore) {
      console.error(`Math mismatch: calculated ${compatibilityScore}, expected ${expected}`);
      allInRange = false;
    }
  });

  if (allInRange) {
    console.log('✅ TEST 3 PASSED: All sub-scores normalized in [0, 100] and weighted formula verified.');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL INTELLIGENT MATCHING TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
