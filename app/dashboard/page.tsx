"use client";

import { useState } from "react";
import { deployContract } from "../lib/deploy";
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js'
export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);


  // Example contract (SimpleStorage)
  const abi = [
    "constructor(uint256 initialValue)",
    "function set(uint256 value)",
    "function get() view returns (uint256)"
  ];

  const bytecode =
    "0x608060405234801561001057600080fd5b506040516101003803806101008339818101604052602081101561003357600080fd5b505160005560c6806100496000396000f3fe608060405260043610601f5760003560e01c806360fe47b11460245780636d4ce63c14603c575b600080fd5b602a6056565b6040518082815260200191505060405180910390f35b6042606c565b005b60005481565b806000819055505056fea2646970667358221220b5a8e9c0b87c91a8bbd28c8b5f4f5c9f0b44f8c5e9b4e8b1d7f3a5f0a0b064736f6c63430008110033";

  const handleDeploy = async () => {
  try {
    const txInput: any = {
  transaction: [{
    data:bytecode,      // contract bytecode + constructor args
    value: "0x0",
  },
  ],
};

const result = await MiniKit.commandsAsync.sendTransaction(txInput);

    const hash = result.finalPayload;

    if (!hash) {
      throw new Error("Transaction hash not returned");
    }
    

    //setTxHash(hash);
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Deployment failed");
  }
};


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">World Chain Contract Deployer</h1>

      <button
        onClick={handleDeploy}
        disabled={loading}
        className="bg-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Deploying..." : "Deploy Contract"}
      </button>

      {address && (
        <p className="mt-6 text-green-400">
          ✅ Deployed at: <br />
          <span className="break-all">{address}</span>
        </p>
      )}
    </div>
  );
}
