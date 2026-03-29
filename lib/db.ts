import { Pool } from 'pg';
const connectionString = process.env.DATABASE_URL || process.env.data_url || '';
const pool = connectionString ? new Pool({ connectionString }) : null;
export default pool;
