import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { ethers } from "ethers";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payload, nonce } = (await req.json()) as IRequestPayload;
    const validMessage = await verifySiweMessage(payload, nonce);
    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
    });


    // Verify the payload from MiniKit
    // const isValid = await verifyWalletAuth(body.finalPayload);

    // if (!isValid) {
      // return NextResponse.json({ success: false, message: "Invalid wallet signature" }, { status: 401 });
    // }

    // Extract wallet address
    const walletAddress = body.finalPayload.address;
    // return NextResponse.json({success:true,error:walletAddress})
    const signature = body.finalPayload.signature;
    const message = body.finalPayload.message;
    // return NextResponse.json({success:true,error:"ethers fucks"})
    
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
