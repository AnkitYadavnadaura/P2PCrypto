// app/api/confirm/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Fetch the order
    const order = await prisma.orders.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status to RELEASED with fake TX
    await prisma.orders.update({
      where: { id: order_id },
      data: {
        status: 'RELEASED',
        release_tx: '0xFAKE_TX_FOR_DEV',
        released_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create a transaction record
    await prisma.transactions.create({
      data: {
        entity_type: 'order',
        entity_id: order_id,
        type: 'DEBIT',
        amount_crypto: order.amount_crypto,
        metadata: { tx: '0xFAKE_TX_FOR_DEV' }, // Prisma handles JSON automatically
        created_at: new Date(),
      },
    });

    return NextResponse.json({ ok: true, tx: '0xFAKE_TX_FOR_DEV' });
  } catch (err) {
    console.error('Error in confirm API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
