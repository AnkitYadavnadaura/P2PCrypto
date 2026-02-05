import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

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
      type,
      status,
    } = body;

    /* =========================
       AUTHORIZATION CHECK
       ========================= */
    const listing = await prisma.listing.findMany({
      where: { userId: walletAddress,
        type:type,

       },
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
    }

    /* =========================
       UPDATE LISTING
       ========================= */
    const updated = await prisma.listing.update({
      where: { userId: walletAddress,
        type:type,

       },
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
