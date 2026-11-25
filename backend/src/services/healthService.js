import { checkDatabaseConnection } from '../config/db.js';
import { env } from '../config/env.js';

/**
 * Health Service
 * Handles business logic for checking application health and dependencies.
 */
export const getSystemHealth = async () => {
  const dbStatus = await checkDatabaseConnection();

  return {
    application: 'SkillSwap API',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
  };
};
