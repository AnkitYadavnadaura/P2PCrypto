import { MiniKit } from "@worldcoin/minikit-js";
import { ethers } from "ethers";
import { ABI } from "./abi";

const contractAddress = "0xb9650bc41b87dc0e6264fb47eacb78dd881dacbc";
const tokenAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";

const sendContractTx = async (
  address: string,
  functionName: string,
  args: readonly unknown[] = [],
) => {
  const res = await MiniKit.commandsAsync.sendTransaction({
    transaction: [
      {
        address,
        abi: ABI,
        functionName: functionName as any,
        args,
        value: "0",
      },
    ],
  });

  return res.finalPayload;
};

/* =========================
   CREATE LISTING
========================= */

export const createSellListing = async (
  amount: string,
  price: string = "1",
  minTrade: string = "1",
  maxTrade: string = amount,
) => {
  await sendContractTx(tokenAddress, "approve", [contractAddress, amount]);
  await sendContractTx(contractAddress, "createListing", [amount, price, 1, minTrade, maxTrade]);
};

export const createBuyListing = async (
  amount: string,
  price: string = "1",
  minTrade: string = "1",
  maxTrade: string = amount,
) => {
  await sendContractTx(contractAddress, "createListing", [amount, price, 0, minTrade, maxTrade]);
};

/* =========================
   JOIN (PARTIAL FILL)
========================= */

export const joinSellAd = async (listingId: number, amount: string) => {
  await sendContractTx(contractAddress, "joinListing", [listingId, amount]);
};

export const joinBuyAd = async (listingId: number, amount: string) => {
  await sendContractTx(tokenAddress, "approve", [contractAddress, amount]);
  await sendContractTx(contractAddress, "joinListing", [listingId, amount]);
};

/* =========================
   TRADE ACTIONS
========================= */

export const markPaid = async (orderId: number) => {
  await sendContractTx(contractAddress, "markPaid", [orderId]);
};

export const release = async (orderId: number) => {
  await sendContractTx(contractAddress, "release", [orderId]);
};

export const getListingCount = async () => {
  if (!(window as any).ethereum) {
    return 0;
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const contract = new ethers.Contract(contractAddress, ABI, provider);
  const count = await contract.listingCount();
  return Number(count);
};
