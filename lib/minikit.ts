// Helper to build wallet sign-in message (frontend usage)
export function buildSigninMessage(nonce: string) {
  return `Sign in to P2P MiniApp: nonce=${nonce}`;
}
