import { MiniKit } from "@worldcoin/minikit-js";
import { Interface, encodeRlp } from "ethers";

export async function deployContract(
  abi: any,
  bytecode: string,
  constructorArgs: any[] = []
) {
  // 1. Encode constructor calldata
  const iface = new Interface(abi);
  const encodedArgs = iface.encodeDeploy(constructorArgs);

  // 2. Full deployment bytecode
  const data = encodeRlp([
    bytecode,
    encodedArgs,
  ]);

  // 3. Send contract creation tx (NO `to`)
  const result = await MiniKit.commandsAsync.sendTransaction({
    transaction: {
      data,
      value: "0x0",
    },
  });

  return result;
}
