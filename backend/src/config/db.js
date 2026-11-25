import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { supabaseAdmin } from './supabaseAdmin.js';

/**
 * Supabase Database Client Configuration (Standard Public / Scoped Client)
 */

export const isSupabaseConfigured = () => {
  return (
    Boolean(env.SUPABASE_URL) && 
    Boolean(env.SUPABASE_ANON_KEY) && 
    !env.SUPABASE_URL.includes('placeholder') &&
    env.SUPABASE_URL.startsWith('https://')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : null;

/**
 * Checks database connectivity status and table presence
 * @returns {Promise<{ connected: boolean, message: string, tablesCount?: number, allTablesPresent?: boolean, detectedTables?: string[], missingTables?: string[] }>}
 */
export const checkDatabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured in backend/.env',
      supabaseUrl: env.SUPABASE_URL || 'Not configured',
    };
  }

  const client = supabaseAdmin || supabase;

  try {
    const requiredTables = [
      'profiles',
      'skill_categories',
      'skills',
      'user_skills',
      'wanted_skills',
      'user_interests',
      'availability',
      'swap_requests',
      'matches',
      'conversations',
      'conversation_members',
      'messages',
      'sessions',
      'reviews',
      'notifications',
    ];

    const detectedTables = [];
    const missingTables = [];

    // Query sample tables to inspect database setup
    for (const table of requiredTables) {
      const { error } = await client.from(table).select('count', { count: 'exact', head: true });
      if (!error || error.code === 'PGRST116') {
        detectedTables.push(table);
      } else if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        missingTables.push(table);
      } else {
        // Table exists but returned a permission or RLS notice
        detectedTables.push(table);
      }
    }

    const allTablesPresent = missingTables.length === 0;

    return {
      connected: true,
      message: allTablesPresent 
        ? 'Connected to Supabase PostgreSQL: all 15 tables verified!'
        : `Connected to Supabase, but ${missingTables.length} tables are missing. Run database/schema.sql in Supabase SQL Editor.`,
      supabaseUrl: env.SUPABASE_URL,
      tablesCount: detectedTables.length,
      allTablesPresent,
      detectedTables,
      missingTables,
    };
  } catch (err) {
    return {
      connected: false,
      message: err.message || 'Failed to communicate with Supabase',
      supabaseUrl: env.SUPABASE_URL,
    };
  }
};
