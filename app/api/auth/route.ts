import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const body = await req.json();
  // route acts as /api/auth with {action:'nonce'|'verify'}
  if (body.action === 'nonce') {
    if (!body.wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });
    const nonce = crypto.randomBytes(16).toString('hex');
    await pool.query('INSERT INTO nonces(wallet, nonce, expires_at) VALUES ($1,$2,now()+interval \"10 minutes\")', [body.wallet, nonce]);
    return NextResponse.json({ nonce });
  }
  if (body.action === 'verify') {
    const { wallet, signature, message } = body;
    if (!wallet || !signature || !message) return NextResponse.json({ error: 'missing' }, { status: 400 });
    try {
      const signer = ethers.verifyMessage(message, signature);
      if (signer.toLowerCase() !== wallet.toLowerCase()) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
      const up = await pool.query('SELECT id FROM users WHERE wallet_address=$1', [wallet]);
      let userId;
      if (up.rowCount === 0) {
        const r = await pool.query('INSERT INTO users(wallet_address, created_at) VALUES ($1,now()) RETURNING id', [wallet]);
        userId = r.rows[0].id;
      } else userId = up.rows[0].id;
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
      return NextResponse.json({ token });
    } catch (err:any) {
      return NextResponse.json({ error: 'verify failed', details: err.message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
