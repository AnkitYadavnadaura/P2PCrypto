import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      walletAddress,
      type,
      cryptoSymbol,
      price,
      minAmount,
      maxAmount,
      balance,
      paymentMethods,
      maxTimeMinutes,
    } = body;

    /* =========================
       BASIC VALIDATION
       ========================= */
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    if (!type || !["BUY", "SELL"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid listing type" },
        { status: 400 }
      );
    }

    if (!cryptoSymbol || !price || !maxAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
      return NextResponse.json(
        { error: "At least one payment method required" },
        { status: 400 }
      );
    }

    /* =========================
       BUSINESS RULES
       ========================= */
    if (type === "SELL" && Number(balance) <= 0) {
      return NextResponse.json(
        { error: "SELL listing must have balance" },
        { status: 400 }
      );
    }

    /* =========================
       CREATE LISTING
       ========================= */
    const listing = await prisma.listing.create({
      data: {
        userId: walletAddress, // wallet = user identity
        type,
        cryptoSymbol,
        price: new Prisma.Decimal(price),
        minAmount: new Prisma.Decimal(minAmount ?? "1"),
        maxAmount: new Prisma.Decimal(maxAmount),
        balance: new Prisma.Decimal(type === "SELL" ? balance : "0"),
        paymentMethods,
        maxTimeMinutes: Number(maxTimeMinutes),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ listing }, { status: 201 });

  } catch (err) {
    console.error("CREATE LISTING ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
