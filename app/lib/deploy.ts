"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { BrowserProvider, ContractFactory } from "ethers";

export async function deployContract(
  abi: any,
  bytecode: string,
  args: any[] = []
): Promise<string> {
  if (!MiniKit.isInstalled()) {
    throw new Error("World MiniKit not installed");
  }

  const session = await MiniKit.getWalletSession();
  if (!session?.provider) {
    throw new Error("Wallet provider not found");
  }

  const provider = new BrowserProvider(session.provider);
  const signer = await provider.getSigner();

  const factory = new ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(...args);

  await contract.waitForDeployment();

  // ✅ FORCE STRING (ethers v6 safe)
  return contract.target.toString();
}
