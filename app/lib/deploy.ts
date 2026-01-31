"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { Interface } from "ethers";

export async function deployContract(
  abi: any,
  bytecode: string,
  args: any[] = []
): Promise<string> {
  if (!MiniKit.isInstalled()) {
    throw new Error("MiniKit not installed");
  }

  // 1. Encode constructor args
  const iface = new Interface(abi);
  const deployData = iface.encodeDeploy(args);

  // 2. Full deployment calldata
  const data = bytecode + deployData.slice(2);

  // 3. Send raw transaction (NO `to` address)
  const tx = await MiniKit.commandsAsync.sendTransaction({
    transaction: {
      to: undefined, // REQUIRED for contract creation
      data,
      value: "0x0",
    },
  });

  if (!tx?.transactionHash) {
    throw new Error("Transaction failed");
  }

  // 4. Compute contract address (EVM rule)
  // World App returns from address
  const from = tx.from;
  const nonce = tx.nonce;

  const deployedAddress = computeContractAddress(from, nonce);

  return deployedAddress;
}

// Helper (EVM standard)
function computeContractAddress(from: string, nonce: number): string {
  const { keccak256, RLP } = require("ethers");
  return "0x" + keccak256(RLP.encode([from, nonce])).slice(26);
}
