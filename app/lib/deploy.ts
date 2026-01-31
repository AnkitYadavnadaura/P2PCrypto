"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { BrowserProvider, ContractFactory } from "ethers";

export async function deployContract(
  abi: any,
  bytecode: string,
  args: any[] = []
) {
  if (!MiniKit.isInstalled()) {
    throw new Error("World MiniKit not installed");
  }

  // 1. Get wallet session
  const session = await MiniKit.getWalletSession();
  if (!session?.provider) {
    throw new Error("Wallet provider not found");
  }

  // 2. Create ethers provider + signer
  const provider = new BrowserProvider(session.provider);
  const signer = await provider.getSigner();

  // 3. Deploy contract
  const factory = new ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(...args);

  // 4. Wait for confirmation
  await contract.waitForDeployment();

  return contract.target; // deployed address
}
