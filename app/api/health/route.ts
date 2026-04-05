import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = connectionString ? new Pool({ connectionString }) : null;

const REQUIRED_ENVS = ['DATABASE_URL'];

export async function GET() {
  const missingEnvVars = REQUIRED_ENVS.filter((envName) => !process.env[envName]);

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        status: 'missing_env',
        missing: missingEnvVars,
      },
      { status: 500 }
    );
  }

  if (!pool) {
    return NextResponse.json(
      {
        ok: false,
        status: 'db_not_configured',
      },
      { status: 500 }
    );
  }

  try {
    await pool.query('SELECT 1');

    return NextResponse.json({
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 'db_unreachable',
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    );
  }
}
