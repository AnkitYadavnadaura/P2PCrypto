import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import Pusher from 'pusher';
import { requireWalletAuth } from '../../lib/auth';
import { checkDurableRateLimit } from '../../lib/durable-guard';
const pool = connectionString ? new Pool({env("data_url")})
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const auth = await requireWalletAuth(body.walletAddress);
  if (!auth.ok) return auth.response;

  const rl = await checkDurableRateLimit("events:post", auth.wallet, 60, 60);
  if (!rl.ok) return rl.response;

  await pool.query('INSERT INTO events(type, payload, created_at) VALUES ($1,$2,now())', [
    body.type,
    JSON.stringify({ ...body, sender: body.sender || auth.wallet }),
  ]);

  if (body.type === 'chat' && body.orderId) {
    await pusher.trigger(`order-${body.orderId}`, 'message:new', {
      text: body.text,
      sender: body.sender || auth.wallet,
    });
  }

  return NextResponse.json({ ok: true });
}
