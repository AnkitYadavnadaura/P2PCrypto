import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id } = body;
  if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 });
  const order = (await pool.query('SELECT * FROM orders WHERE id=$1', [order_id])).rows[0];
  if (!order) return NextResponse.json({ error: 'not found' }, { status: 404 });
  // basic check and fake release tx (replace with KMS + signer in prod)
  await pool.query('UPDATE orders SET status=$1, release_tx=$2, released_at=now(), updated_at=now() WHERE id=$3', ['RELEASED', '0xFAKE_TX_FOR_DEV', order_id]);
  await pool.query('INSERT INTO transactions(entity_type, entity_id, type, amount_crypto, metadata, created_at) VALUES ($1,$2,$3,$4,$5,now())', ['order', order_id, 'DEBIT', order.amount_crypto, JSON_BUILD_OBJECT('tx', '0xFAKE_TX_FOR_DEV')]);
  return NextResponse.json({ ok: true, tx: '0xFAKE_TX_FOR_DEV' });
}
