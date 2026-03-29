import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireWalletAuth(expectedWallet?: string) {
  const cookieStore = await cookies();
  const wallet = cookieStore.get("wallet")?.value;

  if (!wallet) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (expectedWallet && wallet.toLowerCase() !== expectedWallet.toLowerCase()) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Wallet mismatch" },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, wallet };
}
