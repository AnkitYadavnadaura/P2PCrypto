import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { useParams } from 'next/navigation';

export async function PATCH( req: Request) {
  try {
     const params = useParams();
  const orderId = params?.id;
    const body = await req.json();

    const {
      walletAddress,
      price,
      minAmount,
      maxAmount,
      balance,
      paymentMethods,
      maxTimeMinutes,
    } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // 🔒 ownership check
    if (listing.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        priceValue: Number(price),
        minAmount,
        maxAmount,
        balance: Number(balance),
        paymentMethods,
        maxTimeMinutes,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
