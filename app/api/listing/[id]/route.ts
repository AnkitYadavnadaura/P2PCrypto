import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { requireWalletAuth } from "../../../lib/auth";
import { checkRateLimit } from "../../../lib/rate-limit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const listingId = params.id;
    const body = await req.json();

    const {
      walletAddress,
      price,
      minAmount,
      maxAmount,
      balance,
      paymentMethods,
      maxTimeMinutes,
      status,
    } = body;

    const auth = await requireWalletAuth(walletAddress);
    if (!auth.ok) return auth.response;

    const rl = checkRateLimit(`listing:patch:${auth.wallet}`, 40, 60_000);
    if (!rl.ok) return rl.response;

    /* =========================
       AUTHORIZATION CHECK
       ========================= */
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.userId !== walletAddress) {
      return NextResponse.json(
        { error: "Not allowed to edit this listing" },
        { status: 403 }
      );
    }

    /* =========================
       BUSINESS RULES
       ========================= */
    if (listing.type === "SELL" && balance !== undefined) {
      if (Number(balance) < Number(listing.minAmount)) {
        return NextResponse.json(
          { error: "Balance too low" },
          { status: 400 }
        );
      }

      const effectiveMaxAmount = maxAmount ?? listing.maxAmount;
      if (Number(balance) < Number(effectiveMaxAmount)) {
        return NextResponse.json(
          { error: "SELL listing requires escrow-ready balance >= maxAmount" },
          { status: 400 }
        );
      }
    }

    /* =========================
       UPDATE LISTING
       ========================= */
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        price: price ? new Prisma.Decimal(price) : undefined,
        minAmount: minAmount ? new Prisma.Decimal(minAmount) : undefined,
        maxAmount: maxAmount ? new Prisma.Decimal(maxAmount) : undefined,
        balance: balance !== undefined
          ? new Prisma.Decimal(balance)
          : undefined,
        paymentMethods,
        maxTimeMinutes,
        status,
      },
    });

    return NextResponse.json({ listing: updated });

  } catch (err) {
    console.error("UPDATE LISTING ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
