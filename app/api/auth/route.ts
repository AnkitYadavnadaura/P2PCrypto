import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { ethers } from "ethers";
import { cookies } from "next/headers";
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
    // const body = await req.json();
    const { payload, nonce } = (await req.json()) as IRequestPayload;
    const validMessage = await verifySiweMessage(payload, nonce);
    // Save or find user in database (pseudo code)
    // const user = await db.user.upsert({ where: { wallet: walletAddress }, create: { wallet: walletAddress } });
    const walletAddress = payload.address
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { createdAt: new Date() },
      create: {
        walletAddress,
        email: null,
        kycStatus: "PENDING",
      },
    });
    const cookieStore = await cookies();
     cookieStore.set("wallet", payload.address, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

    return Response.json({
    success: true,
    redirect: "/dashboard",
    address : walletAddress,
  });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
