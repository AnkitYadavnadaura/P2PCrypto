import { NextResponse } from "next/server";
import { verifyWalletAuth } from "@worldcoin/minikit-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify the payload from MiniKit
    const isValid = await verifyWalletAuth(body.finalPayload);

    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid wallet signature" }, { status: 401 });
    }

    // Extract wallet address
    const walletAddress = body.finalPayload.address;

    // Save or find user in database (pseudo code)
    // const user = await db.user.upsert({ where: { wallet: walletAddress }, create: { wallet: walletAddress } });
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { lastLogin: new Date() },
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
