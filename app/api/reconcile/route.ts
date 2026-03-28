import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { prisma } from '../../../lib/prisma';
import { ABI } from '../../lib/abi';

const CONTRACT_ADDRESS = process.env.P2P_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.WORLDCHAIN_RPC_URL || '';
const INDEXER_SECRET = process.env.INDEXER_SECRET || '';

function toNum(v: bigint) {
  return Number(v.toString());
}

export async function POST(req: Request) {
  try {
    if (!INDEXER_SECRET) {
      return NextResponse.json({ error: 'Indexer secret not configured' }, { status: 500 });
    }

    const incomingSecret = req.headers.get('x-indexer-secret') || '';
    if (incomingSecret !== INDEXER_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!RPC_URL || !CONTRACT_ADDRESS) {
      return NextResponse.json({ error: 'RPC or contract env missing' }, { status: 500 });
    }

    const { fromBlock, toBlock } = await req.json();
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const latestBlock = await provider.getBlockNumber();

    const from = Number(fromBlock ?? latestBlock - 1_000);
    const to = Number(toBlock ?? latestBlock);

    if (!Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to < from) {
      return NextResponse.json({ error: 'Invalid block range' }, { status: 400 });
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const [createdLogs, paidLogs, releasedLogs, cancelledLogs, disputedLogs] = await Promise.all([
      contract.queryFilter(contract.filters.OrderCreated(), from, to),
      contract.queryFilter(contract.filters.OrderPaid(), from, to),
      contract.queryFilter(contract.filters.OrderReleased(), from, to),
      contract.queryFilter(contract.filters.OrderCancelled(), from, to),
      contract.queryFilter(contract.filters.OrderDisputed(), from, to),
    ]);

    for (const log of createdLogs) {
      const parsed = contract.interface.parseLog(log);
      if (!parsed) continue;

      const orderId = toNum(parsed.args[0]);
      const contractListingId = toNum(parsed.args[1]);
      const taker = String(parsed.args[2]);
      const amount = toNum(parsed.args[3]);
      const price = toNum(parsed.args[4]);

      const listing = await prisma.listing.findFirst({
        where: { contractListingId },
      });

      await prisma.order.upsert({
        where: { id: `chain-${orderId}` },
        update: {
          listingId: listing?.id,
          amountCrypto: amount,
          price,
          fiatAmount: amount * price,
          status: 'CREATED',
        },
        create: {
          id: `chain-${orderId}`,
          listingId: listing?.id,
          amountCrypto: amount,
          price,
          fiatAmount: amount * price,
          status: 'CREATED',
          createdAt: new Date(),
        },
      });

      await prisma.transaction.create({
        data: {
          entity_type: 'ORDER',
          entity_id: `chain-${orderId}`,
          type: 'ONCHAIN_ORDER_CREATED',
          amount_crypto: amount,
          metadata: {
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            taker,
            contractListingId,
          },
        },
      });
    }

    const statusUpdates = [
      { logs: paidLogs, status: 'PAID', type: 'ONCHAIN_ORDER_PAID' },
      { logs: releasedLogs, status: 'RELEASED', type: 'ONCHAIN_ORDER_RELEASED' },
      { logs: cancelledLogs, status: 'CANCELLED', type: 'ONCHAIN_ORDER_CANCELLED' },
      { logs: disputedLogs, status: 'DISPUTED', type: 'ONCHAIN_ORDER_DISPUTED' },
    ];

    for (const group of statusUpdates) {
      for (const log of group.logs) {
        const parsed = contract.interface.parseLog(log);
        if (!parsed) continue;

        const orderId = toNum(parsed.args[0]);

        await prisma.order.updateMany({
          where: { id: `chain-${orderId}` },
          data: { status: group.status },
        });

        await prisma.transaction.create({
          data: {
            entity_type: 'ORDER',
            entity_id: `chain-${orderId}`,
            type: group.type,
            amount_crypto: 0,
            metadata: {
              txHash: log.transactionHash,
              blockNumber: log.blockNumber,
            },
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      range: { from, to },
      counts: {
        created: createdLogs.length,
        paid: paidLogs.length,
        released: releasedLogs.length,
        cancelled: cancelledLogs.length,
        disputed: disputedLogs.length,
      },
    });
  } catch (err) {
    console.error('RECONCILE ERROR', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
