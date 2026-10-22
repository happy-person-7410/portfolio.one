import { neon, neonConfig } from '@neondatabase/serverless';

// Cache connection configuration for serverless environments
neonConfig.fetchConnectionCache = true;

/**
 * Creates an ephemeral Neon query client for an incoming request.
 * Per serverless best practices, connections are not kept alive globally across requests.
 */
export function getNeonClient(connectionString?: string) {
  const url = connectionString || (typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined);
  if (!url) {
    throw new Error('DATABASE_URL is not configured. Please set DATABASE_URL in your environment variables.');
  }
  return neon(url);
}
