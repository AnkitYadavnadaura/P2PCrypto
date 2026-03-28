import { MiniKit } from "@worldcoin/minikit-js";
import { ethers } from "ethers";
import { ABI } from "./abi";

const contractAddress = "0xb9650bc41b87dc0e6264fb47eacb78dd881dacbc";
const tokenAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";

const iface = new ethers.Interface(ABI);

const encode = (fn: string, args: any[]) => {
  return iface.encodeFunctionData(fn, args);
};

const sendTx = async (to: string, data: string) => {
  return await MiniKit.sendTransaction({
    to,
    data,
  });
};

/* =========================
   CREATE LISTING
========================= */

export const createSellListing = async (amount: string) => {
  await sendTx(
    tokenAddress,
    encode("approve", [contractAddress, amount])
  );

  await sendTx(
    contractAddress,
    encode("createListing", [amount, 1])
  );
};

export const createBuyListing = async (amount: string) => {
  await sendTx(
    contractAddress,
    encode("createListing", [amount, 0])
  );
};

/* =========================
   JOIN
========================= */

export const joinSellAd = async (listingId: number) => {
  await sendTx(contractAddress, encode("joinListing", [listingId]));
};

export const joinBuyAd = async (listingId: number, amount: string) => {
  await sendTx(
    tokenAddress,
    encode("approve", [contractAddress, amount])
  );

  await sendTx(contractAddress, encode("joinListing", [listingId]));
};

/* =========================
   TRADE ACTIONS
========================= */

export const markPaid = async (listingId: number) => {
  await sendTx(contractAddress, encode("markPaid", [listingId]));
};

export const release = async (listingId: number) => {
  await sendTx(contractAddress, encode("release", [listingId]));
};

export const getListingCount = async () => {
  const res = await MiniKit.readContract({
    address: contractAddress,
    abi: ABI,
    functionName: "listingCount",
    args: [],
  });

  return Number(res);
};
