import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import { requireWalletAuth } from '../../lib/auth';
import { ORDER_STATUS, canTransitionStatus } from '../../lib/order-state';
import { checkRateLimit } from '../../lib/rate-limit';
import { getIdempotencyResponse, setIdempotencyResponse } from '../../lib/idempotency';

export async function POST(req: Request) {
  try {
    const { order_id, walletAddress } = await req.json();

    const auth = await requireWalletAuth(walletAddress);
    if (!auth.ok) return auth.response;

    const rl = checkRateLimit(`confirm:post:${auth.wallet}`, 20, 60_000);
    if (!rl.ok) return rl.response;

    const idemKey = (req.headers.get('x-idempotency-key') || '').trim();
    if (idemKey) {
      const cached = getIdempotencyResponse(`confirm:post:${auth.wallet}:${idemKey}`);
      if (cached) return cached;
    }

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!canTransitionStatus(order.status, ORDER_STATUS.RELEASED)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${order.status} to RELEASED` },
        { status: 409 },
      );
    }

    if (order.amountCrypto === null) {
      return NextResponse.json(
        { error: 'Invalid order: amountCrypto is null' },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order_id },
        data: {
          status: ORDER_STATUS.RELEASED,
        },
      }),
      prisma.transaction.create({
        data: {
          entity_id: order_id,
          entity_type: 'ORDER',
          type: 'DEBIT',
          amount_crypto: order.amountCrypto,
          metadata: { tx: '0xFAKE_TX_FOR_DEV' },
          created_at: new Date(),
        },
      }),
    ]);

    const payload = { ok: true, tx: '0xFAKE_TX_FOR_DEV' };
    if (idemKey) {
      setIdempotencyResponse(`confirm:post:${auth.wallet}:${idemKey}`, payload);
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error('Error in confirm API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
