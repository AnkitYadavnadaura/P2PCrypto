export const ABI = [
  // Listings
  "function createListing(uint256 totalAmount, uint256 price, uint8 listingType, uint256 minTrade, uint256 maxTrade)",
  "function cancelListing(uint256 listingId)",
  "function listingCount() view returns (uint256)",
  "function listings(uint256 listingId) view returns (uint256 id, address maker, uint8 listingType, uint256 totalAmount, uint256 remainingAmount, uint256 price, uint256 minTrade, uint256 maxTrade, uint8 status)",

  // Orders (partial fills)
  "function joinListing(uint256 listingId, uint256 amount)",
  "function markPaid(uint256 orderId)",
  "function release(uint256 orderId)",
  "function cancelOrder(uint256 orderId)",
  "function openDispute(uint256 orderId)",
  "function orderCount() view returns (uint256)",
  "function orders(uint256 orderId) view returns (uint256 id, uint256 listingId, address maker, address taker, uint256 amount, uint256 price, uint8 status)",

  // Token transfer approval
  "function approve(address spender, uint256 amount)",
];
