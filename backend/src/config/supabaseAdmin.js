import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Administrative Supabase Client (Server-side ONLY)
 * 
 * Uses SUPABASE_SERVICE_ROLE_KEY to perform privileged operations
 * (such as system notifications, initial migrations, administrative verifications).
 * NEVER expose this key to the frontend client.
 */

const isConfigured = 
  Boolean(env.SUPABASE_URL) && 
  Boolean(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY) && 
  !env.SUPABASE_URL.includes('placeholder');

export const supabaseAdmin = isConfigured
  ? createClient(
      env.SUPABASE_URL, 
      env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;
