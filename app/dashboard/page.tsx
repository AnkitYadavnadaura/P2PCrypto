"use client";

import { useState, useEffect } from "react";
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js'
import { PaymentMethod , PaymentMethodType , BankMethod,UPIMethod,BinanceMethod } from "../types/payment";
export default function Dashboard() {
  const [section, setSection] = useState("home");
  const [marketTab, setMarketTab] = useState("buy");
  const [showAddMethod, setShowAddMethod] = useState(false);
const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
const handleSaveMethod = (method: PaymentMethod) => {
  setPaymentMethods((prev) => {
    // EDIT mode
    if (editingMethod) {
      return prev.map((m) =>
        m.id === editingMethod.id ? { ...method, id: editingMethod.id } : m
      );
    }

    // ADD mode
    return [...prev, method];
  });

  setEditingMethod(null);
  setShowAddMethod(false);
};

// Load
useEffect(() => {
  const stored = localStorage.getItem("paymentMethods");
  if (stored) {
    setPaymentMethods(JSON.parse(stored));
  }
}, []);

// Save
useEffect(() => {
  localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
}, [paymentMethods]);



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
          
      {/* Coming Soon Features */}
<div className="col-span-2 mt-2 grid grid-cols-2 gap-3">
  <ComingSoonCard title="Crypto Loans" icon="💳" />
  <ComingSoonCard title="Auto Trading Bot" icon="🤖" />
  <ComingSoonCard title="Escrow Protection" icon="🔐" />
  <ComingSoonCard title="Global Payments" icon="🌍" />
</div>
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
            <div className="grid grid-cols-2 gap-3">
  <StatCard label="Total Trades" value={24} />
  <StatCard label="Successful Trades" value={21} />
  
  <StatCard label="Payment Methods" value={3} />
  <StatCard label="Cancelled Trades" value={2} />
</div>
            <div className="flex justify-between items-center mb-3">
  <h2 className="font-semibold text-sm">Payment Methods</h2>

  <button
    onClick={() => setShowAddMethod(true)}
    className="text-xs bg-gray-700 px-3 py-1 rounded-lg"
  >
    + Add Method
  </button>
</div>

            <div className="space-y-3 mt-3">
  {paymentMethods.length === 0 && (
    <p className="text-xs text-gray-400 text-center">
      No payment methods added yet
    </p>
  )}

  {paymentMethods.map((method) => (
    <PaymentMethodCard
      key={method.id}
      method={method}
      onEdit={(id) => {
        const m = paymentMethods.find((x) => x.id === id);
        if (!m) return;
        setEditingMethod(m);
        setShowAddMethod(true);
      }}
      onRemove={(id) =>
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id))
      }
    />
  ))}
</div>


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
       {showAddMethod && (
  <AddPaymentMethodModal
    onClose={() => {
      setShowAddMethod(false);
      setEditingMethod(null);
    }}
    onSave={handleSaveMethod}
    editingMethod={editingMethod}   // 👈 add this
  />
)}

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


type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};


const TabButton: React.FC<TabButtonProps> = ({
  active,
  children,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-1/2 py-3 font-semibold ${
      active ? "bg-yellow-500 text-black" : "text-gray-300 hover:text-yellow-400"
    }`}
  >
    {children}
  </button>
);


type MarketUser = {
  name: string;
  price: string;
  limit: string;
};

type MarketListProps = {
  users: MarketUser[];
  type: "Buy" | "Sell";
  color: "yellow" | "green";
};
const MarketList: React.FC<MarketListProps> = ({
  users,
  type,
  color,
}) => {
  const buttonColorMap: Record<MarketListProps["color"], string> = {
    yellow: "bg-yellow-400",
    green: "bg-green-400",
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {users.map((u, i) => (
        <div
          key={i}
          className="bg-gray-800 p-4 rounded-xl flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold text-sm">{u.name}</h3>
            <p className="text-xs text-gray-400">
              Price: {u.price} | Limit: {u.limit}
            </p>
          </div>

          <button
            className={`${buttonColorMap[color]} text-black px-4 py-1 rounded-lg font-bold`}
          >
            {type}
          </button>
        </div>
      ))}
    </div>
  );
};


type OrderProps = {
  id: string | number;
  status: "Completed" | "Pending" | "Cancelled";
  type: "Buy" | "Sell";
  amount: string;
};
const Order: React.FC<OrderProps> = ({
  id,
  status,
  type,
  amount,
}) => (
  <div className="bg-gray-800 p-3 rounded-xl">
    <h3>Order #{id}</h3>
    <p className="text-sm text-gray-400">
      Status: {status} | Type: {type} | Amount: {amount}
    </p>
  </div>
);

type NavBtnProps = {
  icon: string;
  label: string;
  onClick: () => void;
};

const NavBtn: React.FC<NavBtnProps> = ({
  icon,
  label,
  onClick,
}) => (
  <button onClick={onClick} className="flex flex-col items-center">
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

type ComingSoonCardProps = {
  title: string;
  icon: string;
};

const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ title, icon }) => {
  return (
    <div className="relative rounded-xl p-4 h-24 flex flex-col items-center justify-center
      bg-white/10 backdrop-blur-lg border border-white/20
      text-gray-300 cursor-not-allowed overflow-hidden">

      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 text-center">
        <div className="text-xl mb-1">{icon}</div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-yellow-400 mt-1">
          Coming Soon ✨
        </div>
      </div>
    </div>
  );
};


interface StatProps {
  label: string;
  value: number | string;
}
const StatCard: React.FC<StatProps> = ({ label, value }) => (
  <div className="bg-gray-800 rounded-xl p-4 text-center">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);


interface PaymentCardProps {
  method: PaymentMethod;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

const PaymentMethodCard: React.FC<PaymentCardProps> = ({
  method,
  onEdit,
  onRemove,
}) => {
  return (
    
    <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-sm">{method.type}</h3>

        {method.type === "UPI" && (
          <p className="text-xs text-gray-400">{method.upiId}</p>
        )}

        {method.type === "BANK" && (
          <p className="text-xs text-gray-400">
            {method.bankName} • ****{method.accountNumber.slice(-4)}
          </p>
        )}

        {method.type === "BINANCE" && (
          <p className="text-xs text-gray-400">
            Binance Pay {method.binanceId ? "ID" : "QR"}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => onEdit(method.id)}>✏️</button>
        <button onClick={() => onRemove(method.id)}>🗑</button>
      </div>
    </div>
  );
};


interface AddMethodProps {
  onClose: () => void;
  onSave: (method: PaymentMethod) => void;
  editingMethod: PaymentMethod | null;
}


interface BankFormProps {
  onSave: (method: PaymentMethod) => void;
  method?: BankMethod;
}

const BankForm: React.FC<BankFormProps> = ({ onSave, method }) => {
  const [holderName, setholderName] = useState(method?.holderName || "");
  const [accountNumber, setAccountNumber] = useState(method?.accountNumber || "");
  const [ifsc, setIfsc] = useState(method?.ifsc || "");
  const [bankName, setBankName] = useState(method?.bankName || "");

  const handleSave = () => {
    onSave({
      ...(method ?? {}),
      id: method?.id ?? crypto.randomUUID(),
      type: "BANK",
      holderName,
      accountNumber,
      ifsc,
      bankName,
      createdAt: method?.createdAt ?? Date.now(),
    });
  };

  return (
    <div className="space-y-3">
      <input placeholder="Account Holder Name" value={accountName}
        onChange={(e) => setAccountName(e.target.value)} className="input" />

      <input placeholder="Account Number" value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)} className="input" />

      <input placeholder="IFSC Code" value={ifsc}
        onChange={(e) => setIfsc(e.target.value)} className="input" />

      <input placeholder="Bank Name" value={bankName}
        onChange={(e) => setBankName(e.target.value)} className="input" />

      <button onClick={handleSave} className="btn-primary w-full">
        Save Bank Method
      </button>
    </div>
  );
};


interface BinanceFormProps {
  onSave: (method: PaymentMethod) => void;
  method?: BinanceMethod;
}

const BinanceForm: React.FC<BinanceFormProps> = ({ onSave, method }) => {
  const [binanceId, setBinanceId] = useState(method?.binanceId || "");

  const handleSave = () => {
    onSave({
      ...(method ?? {}),
      id: method?.id ?? crypto.randomUUID(),
      type: "BINANCE",
      binanceId,
      createdAt: method?.createdAt ?? Date.now(),
    });
  };

  return (
    <div className="space-y-3">
      <input
        placeholder="Binance Pay ID / Email"
        value={binanceId}
        onChange={(e) => setBinanceId(e.target.value)}
        className="input"
      />

      <button onClick={handleSave} className="btn-primary w-full">
        Save Binance Pay
      </button>
    </div>
  );
};


const AddPaymentMethodModal: React.FC<AddMethodProps> = ({
  onClose,
  onSave,
  editingMethod,
}) => {
  const [type, setType] = useState<PaymentMethodType>(
    editingMethod?.type ?? "UPI"
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end">
      <div className="bg-gray-900 w-full rounded-t-2xl p-5">
        <h2 className="font-semibold mb-3">
          {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
        </h2>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as PaymentMethodType)}
          className="w-full bg-gray-800 p-3 rounded-lg mb-4"
        >
          <option value="UPI">UPI</option>
          <option value="BANK">Bank Transfer</option>
          <option value="BINANCE">Binance Pay</option>
        </select>

        {type === "UPI" && (
          <UPIForm onSave={onSave} method={editingMethod ?? undefined} />
        )}

        {type === "BANK" && (
          <BankForm onSave={onSave} method={editingMethod ?? undefined} />
        )}

        {type === "BINANCE" && (
          <BinanceForm onSave={onSave} method={editingMethod ?? undefined} />
        )}

        <button onClick={onClose} className="mt-4 text-sm text-gray-400">
          Cancel
        </button>
      </div>
    </div>
  );
};




interface UPIFormProps {
  onSave: (method: PaymentMethod) => void;
  method?: UPIMethod;
}

const UPIForm: React.FC<UPIFormProps> = ({ onSave, method }) => {
  const [upiId, setUpiId] = useState(method?.upiId || "");

  const handleSave = () => {
    onSave({
      ...(method ?? {}),
      id: method?.id ?? crypto.randomUUID(),
      type: "UPI",
      upiId,
      createdAt: method?.createdAt ?? Date.now(),
    });
  };

  return (
    <>
      <input
        placeholder="UPI ID"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        className="w-full bg-gray-800 p-3 rounded-lg mb-3"
      />

      <button
        onClick={handleSave}
        className="w-full bg-green-500 text-black py-3 rounded-xl"
      >
        {method ? "Update UPI Method" : "Save UPI Method"}
      </button>
    </>
  );
};




