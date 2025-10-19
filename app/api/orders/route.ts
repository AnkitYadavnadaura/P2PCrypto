import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const r = await pool.query('SELECT o.*, l.crypto_symbol FROM orders o LEFT JOIN listings l ON o.listing_id=l.id ORDER BY o.created_at DESC LIMIT 100');
  return NextResponse.json(r.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // minimal create: creates a 'listing' on the fly for dev speed
  const { title, amount_crypto=1, crypto_symbol='USDT', price_value=100 } = body;
  const listing = (await pool.query('INSERT INTO listings(seller_id, title, type, crypto_symbol, amount_min, amount_max, price_type, price_value, payment_methods, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,\'ACTIVE\', now()) RETURNING id', [null, title, 'sell', crypto_symbol, amount_crypto, amount_crypto, 'fixed', price_value, JSON.stringify(['UPI'])])).rows[0];
  const order = (await pool.query('INSERT INTO orders(id, listing_id, buyer_id, seller_id, amount_crypto, price, fiat_amount, status, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, now()) RETURNING *', [listing.id, null, null, amount_crypto, price_value, amount_crypto*price_value, 'CREATED'])).rows[0];
  return NextResponse.json(order);
}
