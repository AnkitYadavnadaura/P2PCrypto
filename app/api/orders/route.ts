import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireWalletAuth } from '../../lib/auth';
import { ORDER_STATUS, canTransitionStatus } from '../../lib/order-state';

export async function GET() {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { listingId, amountCrypto, price, walletAddress } = body;

  const auth = await requireWalletAuth(walletAddress);
  if (!auth.ok) return auth.response;

  if (!listingId) {
    return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Listing is not available' }, { status: 404 });
  }

  const amount = Number(amountCrypto);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'amountCrypto must be > 0' }, { status: 400 });
  }

  if (amount < Number(listing.minAmount) || amount > Number(listing.maxAmount)) {
    return NextResponse.json({ error: 'amountCrypto out of listing limits' }, { status: 400 });
  }

  const executionPrice = Number(price ?? listing.price);
  const fiatAmount = amount * executionPrice;

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      amountCrypto: amount,
      price: executionPrice,
      fiatAmount,
      status: ORDER_STATUS.CREATED,
      createdAt: new Date(),
    },
  });

  return NextResponse.json(order, { status: 201 });
}


export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { orderId, nextStatus, walletAddress } = body;

  const auth = await requireWalletAuth(walletAddress);
  if (!auth.ok) return auth.response;

  if (!orderId || !nextStatus) {
    return NextResponse.json({ error: 'orderId and nextStatus are required' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!canTransitionStatus(order.status, nextStatus)) {
    return NextResponse.json(
      { error: `Invalid status transition from ${order.status} to ${nextStatus}` },
      { status: 409 },
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: nextStatus },
  });

  return NextResponse.json({ order: updated });
}
