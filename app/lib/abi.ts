export const ABI = [
  // Core functions
  "function createListing(uint256 amount, uint8 listingType)",
  "function joinListing(uint256 id)",
  "function markPaid(uint256 id)",
  "function release(uint256 id)",

  // ⭐ READ FUNCTIONS (IMPORTANT)
  "function listingCount() view returns (uint256)",

  // ⭐ OPTIONAL (future use)
  "function listings(uint256 id) view returns (uint256 id, address seller, address buyer, uint256 amount, uint8 status, uint8 listingType)"
  "function approve(address spender, uint256 amount)"
];
