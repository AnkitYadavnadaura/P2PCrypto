"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { Interface, keccak256, RLP } from "ethers";

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
  const encodedArgs = iface.encodeDeploy(args);

  // 2. Full deploy calldata
  const data = bytecode + encodedArgs.slice(2);

  // 3. Send RAW transaction (contract creation)
  const result = await MiniKit.commandsAsync.sendTransaction({
    transactions: [
      {
        data,                 // REQUIRED
        value: "0x0",         // REQUIRED (hex)
      },
    ],
  });

  if (!result || !result.transactions?.[0]) {
    throw new Error("Transaction failed");
  }

  const tx = result.transactions[0];

  // 4. Compute deployed contract address (EVM standard)
  const contractAddress =
    "0x" +
    keccak256(
      RLP.encode([tx.from, tx.nonce])
    ).slice(26);

  return contractAddress;
}
