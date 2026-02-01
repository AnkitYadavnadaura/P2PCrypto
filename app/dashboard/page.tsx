"use client";

import { useState } from "react";
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js'
export default function Dashboard() {
  const [section, setSection] = useState("home");
  const [marketTab, setMarketTab] = useState("buy");

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-gray-900 to-black py-4 text-center text-lg font-semibold shadow-lg z-50">
        P2P Services
      </nav>

      {/* Main */}
      <main className="pt-16 pb-20 min-h-screen overflow-hidden">
        {/* Home */}
        {section === "home" && (
          <section className="grid grid-cols-2 gap-3 p-3">
            <ActionButton label="P2P" emoji="🪙" onClick={() => setSection("market")} color="yellow" />
            <ActionButton label="Mobile Recharge" emoji="📱" onClick={() => setSection("recharge")} color="blue" />
            <ActionButton label="Chat Support" emoji="💬" onClick={() => setSection("chat")} color="green" />
            <ActionButton label="Wallet" emoji="💼" onClick={() => setSection("coming")} color="purple" />
          </section>
        )}

        {/* Market */}
        {section === "market" && (
          <section className="flex flex-col h-[calc(100vh-96px)]">
            <div className="flex bg-gray-900 border-b border-gray-700">
              <TabButton active={marketTab === "buy"} onClick={() => setMarketTab("buy")}>
                BUY
              </TabButton>
              <TabButton active={marketTab === "sell"} onClick={() => setMarketTab("sell")}>
                SELL
              </TabButton>
            </div>

            {marketTab === "buy" && (
              <MarketList
                type="Buy"
                color="yellow"
                users={[
                  { name: "User123", price: "₹84.5", limit: "₹500 - ₹50,000" },
                  { name: "CryptoKing", price: "₹84.4", limit: "₹1,000 - ₹100,000" }
                ]}
              />
            )}

            {marketTab === "sell" && (
              <MarketList
                type="Sell"
                color="green"
                users={[
                  { name: "TraderPro", price: "₹84.8", limit: "₹1,000 - ₹75,000" },
                  { name: "CoinGuru", price: "₹84.9", limit: "₹500 - ₹25,000" }
                ]}
              />
            )}
          </section>
        )}

        {/* Recharge */}
        {section === "recharge" && (
          <section className="p-4 space-y-3">
            <h2 className="text-xl font-semibold">Mobile Recharge</h2>

            <input placeholder="Enter Mobile Number" className="input" />
            <select className="input">
              <option>Select Operator</option>
              <option>Jio</option>
              <option>Airtel</option>
              <option>VI</option>
              <option>BSNL</option>
            </select>

            <button className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold">
              Proceed to Pay
            </button>
          </section>
        )}

        {/* Chat */}
        {section === "chat" && (
          <section className="p-4 flex flex-col h-[calc(100vh-96px)]">
            <h2 className="text-xl font-semibold mb-3">Chat Support</h2>
            <div className="flex-1 bg-gray-900 rounded-lg p-3 text-gray-400 text-sm">
              No tickets yet.
            </div>
            <textarea className="input mt-2" placeholder="Describe your issue..." />
            <button className="bg-green-500 text-black py-2 rounded-lg font-bold mt-2">
              Raise Ticket
            </button>
          </section>
        )}

        {/* Coming Soon */}
        {section === "coming" && (
          <section className="flex flex-col justify-center items-center h-[calc(100vh-96px)]">
            <h2 className="text-2xl text-yellow-400 font-semibold">Coming Soon 🚀</h2>
            <p className="text-gray-400">This feature is under development.</p>
          </section>
        )}

        {/* Orders */}
        {section === "orders" && (
          <section className="p-4 space-y-3">
            <h2 className="text-xl font-semibold">Orders</h2>
            <Order id="12345" status="Completed" type="Buy" amount="₹2,000" />
            <Order id="12346" status="Pending" type="Sell" amount="₹5,000" />
          </section>
        )}

        {/* Profile */}
        {section === "profile" && (
          <section className="p-4">
            <h2 className="text-xl font-semibold mb-3">My Profile</h2>
            <button className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold">
              + List New Ad
            </button>
          </section>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700 flex justify-around py-2 text-xs">
        <NavBtn icon="🏠" label="Home" onClick={() => setSection("home")} />
        <NavBtn icon="📈" label="Market" onClick={() => setSection("market")} />
        <NavBtn icon="🧾" label="Orders" onClick={() => setSection("orders")} />
        <NavBtn icon="👤" label="Profile" onClick={() => setSection("profile")} />
      </nav>
    </div>
  );
}

/* ---------------- Components ---------------- */
type ActionButtonProps = {
  emoji: string;
  label: string;
  color: "yellow" | "blue" | "green" | "purple";
  onClick: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  emoji,
  label,
  onClick,
  color,
}) => {
  const colorMap: Record<ActionButtonProps["color"], string> = {
    yellow: "from-yellow-400 to-yellow-600",
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-green-600",
    purple: "from-purple-400 to-purple-600",
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-b ${colorMap[color]} text-gray-900 font-semibold py-6 rounded-xl shadow-xl active:scale-95 transition text-center text-sm`}
    >
      {emoji}
      <br />
      {label}
    </button>
  );
};



const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`w-1/2 py-3 font-semibold ${
      active ? "bg-yellow-500 text-black" : "text-gray-300"
    }`}
  >
    {children}
  </button>
);

const MarketList = ({ users, type, color }) => (
  <div className="flex-1 overflow-y-auto p-3 space-y-3">
    {users.map((u, i) => (
      <div key={i} className="bg-gray-800 p-4 rounded-xl flex justify-between">
        <div>
          <h3 className="font-semibold text-sm">{u.name}</h3>
          <p className="text-xs text-gray-400">
            Price: {u.price} | Limit: {u.limit}
          </p>
        </div>
        <button className={`bg-${color}-400 text-black px-4 py-1 rounded-lg`}>
          {type}
        </button>
      </div>
    ))}
  </div>
);

const Order = ({ id, status, type, amount }) => (
  <div className="bg-gray-800 p-3 rounded-xl">
    <h3>Order #{id}</h3>
    <p className="text-sm text-gray-400">
      Status: {status} | Type: {type} | Amount: {amount}
    </p>
  </div>
);

const NavBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center">
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);
