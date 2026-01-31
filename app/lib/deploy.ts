"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { Interface, keccak256, encodeRlp } from "ethers";

export async function deployContract(
  abi: any,
  bytecode: string,
  args: any[] = []
): Promise<string> {
  if (!MiniKit.isInstalled()) {
    throw new Error("MiniKit not installed");
  }

  // 1. Encode constructor arguments
  const iface = new Interface(abi);
  const encodedArgs = iface.encodeDeploy(args);

  // 2. Full deployment calldata
  const data = bytecode + encodedArgs.slice(2);

  // 3. Send raw contract-creation transaction
  const result = await MiniKit.commandsAsync.sendTransaction({
    transactions: [
      {
        data,
        value: "0x0",
      },
    ],
  });

  if (!result?.transactions?.[0]) {
    throw new Error("Transaction failed");
  }

  const tx = result.transactions[0];

  // 4. Compute deployed contract address (EVM standard)
  const contractAddress =
    "0x" +
    keccak256(
      encodeRlp([tx.from, tx.nonce])
    ).slice(26);

  return contractAddress;
}
