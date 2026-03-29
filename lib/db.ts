import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.data_url });
export default pool;
