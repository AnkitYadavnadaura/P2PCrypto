"use client";
import Link from 'next/link';
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js'
// ...
export default function Page(){
  
const signInWithWallet = async () => {
	// alert("function Called")
  if (!MiniKit.isInstalled()) {
    console.warn("MiniKit not installed");
	  // alert("miniKit not Installed")
    return;
  }
	// alert("hello bro")

  try {
	  const splMessage = {
        nonce: Date.now().toString(), // ✅ must be string
        requestId: "0", // optional
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days ahead
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day before
        statement:
          "This is my statement and here is a link https://worldcoin.com/apps",
      }
    const { commandPayload: generateMessageResult, finalPayload } =
      await MiniKit.commandsAsync.walletAuth(splMessage);

    console.log("Auth success:", { generateMessageResult, finalPayload });
	  alert(JSON.stringify(finalPayload))
	  alert(JSON.stringify(generateMessageResult))
	  // alert("success")
	  // Send to backend for verification
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({finalPayload,message:splMessage}),
      });

      const data = await res.json();
	  alert(JSON.stringify(data))
      if (data.success) alert("Login successful!");
      else alert("Login failed");
  } catch (err) {
    console.error("Wallet auth failed:", err);
	  // alert(err)
  }
}

	// ...
  return (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-slate-800 text-white">
    {/* <!-- Header --> */}
    <div className="text-center mb-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">P2P Services</h1>
      <p className="text-gray-300 mt-2 text-sm">
        Buy & sell crypto directly with fiat.  
        Recharge your phone instantly using crypto.
      </p>
    </div>

    {/* <!-- Icon or Illustration --> */}
    <div className="flex justify-center mb-8">
      <div className="w-24 h-24 bg-indigo-500 bg-opacity-20 flex items-center justify-center rounded-full shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8c1.657 0 3 1.343 3 3v4H9v-4c0-1.657 1.343-3 3-3zM4 12v7h16v-7M4 12l8-8m0 0l8 8" />
        </svg>
      </div>
    </div>

    {/* <!-- Services Section --> */}
    <div className="mb-10 text-center space-y-3">
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-3">
        <p className="font-semibold text-indigo-300">🔁 P2P Crypto Exchange</p>
        <p className="text-sm text-gray-400">Trade crypto safely with verified users.</p>
      </div>
      <div className="bg-gray-800 bg-opacity-50 rounded-xl p-3">
        <p className="font-semibold text-indigo-300">📱 Mobile Recharge</p>
        <p className="text-sm text-gray-400">Use crypto to recharge instantly.</p>
      </div>
    </div>

    {/* <!-- Connect Button --> */}
    <div className="flex justify-center">
      <button onClick={signInWithWallet} className="bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all duration-200 text-white font-semibold px-10 py-3 rounded-full shadow-lg">
        Connect
      </button>
    </div>

    {/* <!-- Footer --> */}
    <div className="text-center mt-8">
      <p className="text-xs text-gray-500">Powered by <span className="text-indigo-400 font-semibold">P2P Services</span></p>
    </div>
  </div>
  )
}
