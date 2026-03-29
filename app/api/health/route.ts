import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.data_url || '';
const pool = connectionString ? new Pool({ connectionString }) : null;

const REQUIRED_ENVS = [
  'DATABASE_URL/data_url',
  'P2P_CONTRACT_ADDRESS',
  'WORLDCHAIN_RPC_URL',
  'INDEXER_SECRET',
  'PUSHER_APP_ID',
  'PUSHER_KEY',
  'PUSHER_SECRET',
  'PUSHER_CLUSTER',
] as const;

export async function GET() {
  const missing = REQUIRED_ENVS.filter((k) => {
    if (k === 'DATABASE_URL/data_url') return !(process.env.DATABASE_URL || process.env.data_url);
    return !process.env[k];
  });

  let dbOk = false;
  try {
    if (!pool) throw new Error('DB connection string missing');
    await pool.query('SELECT 1');
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const ok = missing.length === 0 && dbOk;

  return NextResponse.json(
    {
      ok,
      db: dbOk ? 'up' : 'down',
      missing_env: missing,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
