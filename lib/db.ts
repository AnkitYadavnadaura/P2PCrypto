import { Pool } from 'pg';
const connectionString = process.env.DATABASE_URL || process.env.data_url || '';
const pool = new Pool({ env("data_url") });
export default pool;
