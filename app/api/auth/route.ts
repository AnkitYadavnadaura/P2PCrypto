import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { ethers } from "ethers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify the payload from MiniKit
    // const isValid = await verifyWalletAuth(body.finalPayload);

    // if (!isValid) {
      // return NextResponse.json({ success: false, message: "Invalid wallet signature" }, { status: 401 });
    // }

    // Extract wallet address
    const walletAddress = body.finalPayload.address;
    const signature = body.finalPayload.signature;
    const message = "This is my statement and here is a link https://worldcoin.com/apps";
    if (!walletAddress || !signature) {
      return NextResponse.json({ success: false, error: "Missing wallet data" }, { status: 400 });
    }
    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }
    // Save or find user in database (pseudo code)
    // const user = await db.user.upsert({ where: { wallet: walletAddress }, create: { wallet: walletAddress } });
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { createdAt: new Date() },
      create: {
        walletAddress,
        email: null,
        kycStatus: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      wallet: walletAddress,
      user
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
