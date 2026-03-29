import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.data_url || '';
const pool = connectionString ? new Pool({ connectionString }) : null;
let initialized = false;
let durableAvailable = Boolean(pool);
const memoryCheckpoints = new Map<string, number>();

async function ensureTables() {
  if (initialized || !durableAvailable || !pool) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        scope text NOT NULL,
        idempotency_key text NOT NULL,
        response_payload jsonb NOT NULL,
        status_code int NOT NULL DEFAULT 200,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (scope, idempotency_key)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rate_limit_hits (
        scope text NOT NULL,
        subject_key text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_scope_key_created
      ON rate_limit_hits(scope, subject_key, created_at DESC);`,
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sync_checkpoints (
        name text PRIMARY KEY,
        block_number bigint NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    initialized = true;
  } catch (err) {
    durableAvailable = false;
    console.error('Durable guard disabled; falling back to soft mode.', err);
  }
}

export async function checkDurableRateLimit(
  scope: string,
  subjectKey: string,
  limit: number,
  windowSeconds: number,
) {
  await ensureTables();
  if (!durableAvailable || !pool) {
    return { ok: true as const };
  }

  try {
    await pool.query(
      `DELETE FROM rate_limit_hits
      WHERE created_at < now() - ($1::int * interval '1 second')`,
      [windowSeconds],
    );

    const countRes = await pool.query(
      `SELECT count(*)::int AS count
        FROM rate_limit_hits
        WHERE scope = $1
          AND subject_key = $2
          AND created_at >= now() - ($3::int * interval '1 second')`,
      [scope, subjectKey, windowSeconds],
    );

    const count = countRes.rows[0]?.count ?? 0;
    if (count >= limit) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: { 'Retry-After': String(windowSeconds) } },
        ),
      };
    }

    await pool.query(
      `INSERT INTO rate_limit_hits(scope, subject_key, created_at)
      VALUES ($1, $2, now())`,
      [scope, subjectKey],
    );

    return { ok: true as const };
  } catch (err) {
    console.error('Rate limit guard soft-fail', err);
    return { ok: true as const };
  }
}

export async function getDurableIdempotency(scope: string, key: string) {
  await ensureTables();
  if (!durableAvailable || !pool) return null;

  try {
    const res = await pool.query(
      `SELECT response_payload, status_code
        FROM idempotency_keys
        WHERE scope = $1
          AND idempotency_key = $2
          AND expires_at > now()`,
      [scope, key],
    );

    const row = res.rows[0];
    if (!row) return null;
    return NextResponse.json(row.response_payload, { status: row.status_code });
  } catch (err) {
    console.error('Idempotency read soft-fail', err);
    return null;
  }
}

export async function setDurableIdempotency(
  scope: string,
  key: string,
  payload: unknown,
  statusCode = 200,
  ttlSeconds = 60,
) {
  await ensureTables();
  if (!durableAvailable || !pool) return;

  try {
    await pool.query(
      `INSERT INTO idempotency_keys(scope, idempotency_key, response_payload, status_code, expires_at)
      VALUES ($1, $2, $3::jsonb, $4, now() + ($5::int * interval '1 second'))
      ON CONFLICT (scope, idempotency_key)
      DO UPDATE SET
        response_payload = EXCLUDED.response_payload,
        status_code = EXCLUDED.status_code,
        expires_at = EXCLUDED.expires_at,
        created_at = now()`,
      [scope, key, JSON.stringify(payload), statusCode, ttlSeconds],
    );
  } catch (err) {
    console.error('Idempotency write soft-fail', err);
  }
}

export async function getCheckpoint(name: string): Promise<number | null> {
  await ensureTables();
  if (!durableAvailable || !pool) {
    return memoryCheckpoints.get(name) ?? null;
  }

  try {
    const res = await pool.query('SELECT block_number FROM sync_checkpoints WHERE name = $1', [name]);
    const row = res.rows[0];
    return row ? Number(row.block_number) : null;
  } catch (err) {
    console.error('Checkpoint read soft-fail', err);
    return memoryCheckpoints.get(name) ?? null;
  }
}

export async function setCheckpoint(name: string, blockNumber: number) {
  await ensureTables();
  memoryCheckpoints.set(name, blockNumber);

  if (!durableAvailable || !pool) return;

  try {
    await pool.query(
      `INSERT INTO sync_checkpoints(name, block_number, updated_at)
      VALUES ($1, $2, now())
      ON CONFLICT (name)
      DO UPDATE SET block_number = EXCLUDED.block_number, updated_at = now()`,
      [name, blockNumber],
    );
  } catch (err) {
    console.error('Checkpoint write soft-fail', err);
  }
}
