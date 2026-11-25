import { checkDatabaseConnection, isSupabaseConfigured } from '../config/db.js';
import { env } from '../config/env.js';

/**
 * Database Verification CLI Script
 * Run with: npm run db:verify
 */
async function runVerification() {
  console.log('======================================================');
  console.log('🔍 SkillSwap Database Connection & Schema Verification');
  console.log('======================================================\n');

  console.log(`📡 Supabase URL: ${env.SUPABASE_URL ? env.SUPABASE_URL : '(None)'}`);
  console.log(`🔑 Anon Key:     ${env.SUPABASE_ANON_KEY ? 'Present (configured)' : '(Missing)'}`);
  console.log(`🛡️  Admin Key:    ${env.SUPABASE_SERVICE_ROLE_KEY ? 'Present (configured)' : '(Missing)'}\n`);

  if (!isSupabaseConfigured()) {
    console.log('❌ STATUS: Supabase is NOT configured yet.');
    console.log('\n📋 Quick Setup Instructions:');
    console.log('1. Create a free project at https://supabase.com');
    console.log('2. Navigate to Project Settings -> API in your Supabase dashboard');
    console.log('3. Copy your "Project URL" and "anon / public key"');
    console.log('4. Paste them into `backend/.env` and `frontend/.env`:');
    console.log('     SUPABASE_URL=https://<your-project>.supabase.co');
    console.log('     SUPABASE_ANON_KEY=<your-anon-key>');
    console.log('     SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
    console.log('5. Open the Supabase SQL Editor and execute `database/schema.sql`');
    console.log('6. Re-run: npm run db:verify\n');
    console.log('======================================================');
    process.exit(1);
  }

  console.log('⏳ Connecting to Supabase PostgreSQL instance...');
  const result = await checkDatabaseConnection();

  if (result.connected) {
    console.log(`\n✅ ${result.message}\n`);
    console.log(`📊 Verified Tables (${result.detectedTables.length}/15):`);
    result.detectedTables.forEach((t) => console.log(`   ✔️  ${t}`));

    if (result.missingTables.length > 0) {
      console.log(`\n⚠️  Missing Tables (${result.missingTables.length}):`);
      result.missingTables.forEach((t) => console.log(`   ❌ ${t}`));
      console.log('\n💡 To create missing tables, copy and run `database/schema.sql` in the Supabase SQL Editor.');
    } else {
      console.log('\n🎉 Database schema is fully normalized, indexed, and ready!');
    }
  } else {
    console.log(`\n❌ Connection failed: ${result.message}`);
    console.log('\n💡 Please check that your SUPABASE_URL and SUPABASE_ANON_KEY in `backend/.env` are valid.');
  }

  console.log('======================================================\n');
  process.exit(result.connected && result.allTablesPresent ? 0 : 1);
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
