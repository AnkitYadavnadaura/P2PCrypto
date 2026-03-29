import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = connectionString ? new Pool({env("data_url")});

const REQUIRED_ENVS = [
  'DATABASE_URL',
  'P2P_CONTRACT_ADDRESS',
  'WORLDCHAIN_RPC_URL',
  'INDEXER_SECRET',
  'PUSHER_APP_ID',
  'PUSHER_KEY',
  'PUSHER_SECRET',
  'PUSHER_CLUSTER',
] as const;

export async function GET() {
  const missing = REQUIRED_ENVS.filter((k) => !process.env[k]);

  let dbOk = false;
  try {
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
