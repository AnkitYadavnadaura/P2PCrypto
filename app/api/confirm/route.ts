// app/api/confirm/route.ts
import { prisma } from '../../../lib/prisma'; // use relative path or @ alias if configured
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    await prisma.order.update({
      where: { id: order_id },
      data: {
        status: 'RELEASED',
        createdAt: new Date(), // optional: update timestamp if needed
      },
    });

    if (order.amountCrypto === null) {
  return NextResponse.json(
    { error: "Invalid order: amountCrypto is null" },
    { status: 400 }
  );
}

await prisma.transaction.create({
  data: {
    entity_id: order_id,
    type: "DEBIT",
    amount_crypto: order.amountCrypto,
    metadata: { tx: "0xFAKE_TX_FOR_DEV" },
    created_at: new Date(),
  },
});

    return NextResponse.json({ ok: true, tx: '0xFAKE_TX_FOR_DEV' });
  } catch (err) {
    console.error('Error in confirm API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
