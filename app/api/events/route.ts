import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import Pusher from 'pusher';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: true
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  // body: { type:'chat'|'event', orderId, text, sender }
  await pool.query('INSERT INTO events(type, payload, created_at) VALUES ($1,$2,now())', [body.type, JSON.stringify(body)]);
  if (body.type === 'chat' && body.orderId) {
    // publish to pusher channel order-{orderId}
    pusher.trigger('order-' + body.orderId, 'message:new', { text: body.text, sender: body.sender || 'user' });
  }
  return NextResponse.json({ ok: true });
}
