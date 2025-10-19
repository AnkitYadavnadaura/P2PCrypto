import Link from 'next/link';
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js'
// ...
export default function Page(){
  
const signInWithWallet = async () => {
	if (!MiniKit.isInstalled()) {
		return
	}
	// const res = await fetch(`/api/nonce`)
	// const { nonce } = await res.json()

	const {commandPayload: generateMessageResult, finalPayload} = await MiniKit.commandsAsync.walletAuth({
		nonce: 1,
		requestId: '0', // Optional
		expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
		notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		statement: 'This is my statement and here is a link https://worldcoin.com/apps',
	})
	// ...
  return (
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>P2P Services</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 to-gray-800 flex items-center justify-center min-h-screen text-white">

  <div class="w-[360px] max-w-full px-6 py-10 rounded-2xl shadow-2xl bg-gradient-to-b from-gray-900 to-slate-800">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-indigo-400">P2P Services</h1>
      <p class="text-gray-300 mt-2 text-sm">
        Buy & sell crypto directly with fiat.  
        Recharge your phone instantly using crypto.
      </p>
    </div>

    <!-- Icon or Illustration -->
    <div class="flex justify-center mb-8">
      <div class="w-24 h-24 bg-indigo-500 bg-opacity-20 flex items-center justify-center rounded-full shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8c1.657 0 3 1.343 3 3v4H9v-4c0-1.657 1.343-3 3-3zM4 12v7h16v-7M4 12l8-8m0 0l8 8" />
        </svg>
      </div>
    </div>

    <!-- Services Section -->
    <div class="mb-10 text-center space-y-3">
      <div class="bg-gray-800 bg-opacity-50 rounded-xl p-3">
        <p class="font-semibold text-indigo-300">🔁 P2P Crypto Exchange</p>
        <p class="text-sm text-gray-400">Trade crypto safely with verified users.</p>
      </div>
      <div class="bg-gray-800 bg-opacity-50 rounded-xl p-3">
        <p class="font-semibold text-indigo-300">📱 Mobile Recharge</p>
        <p class="text-sm text-gray-400">Use crypto to recharge instantly.</p>
      </div>
    </div>

    <!-- Connect Button -->
    <div class="flex justify-center">
      <button onclick={signInWithWallet} class="bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all duration-200 text-white font-semibold px-10 py-3 rounded-full shadow-lg">
        Connect
      </button>
    </div>

    <!-- Footer -->
    <div class="text-center mt-8">
      <p class="text-xs text-gray-500">Powered by <span class="text-indigo-400 font-semibold">P2P Services</span></p>
    </div>
  </div>

</body>
</html>

  )
}
