'use client';
import { useState } from "react";

type AdType = "BUY" | "SELL";

interface Ad {
  id: string;
  type: AdType;
  price: string;
  paymentMethods: string[];
  maxTime: string;
  maxAmount: string;
  balance: number;
  status: "ACTIVE" | "PAUSED";
}

export default function AdsDashboard() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeTab, setActiveTab] = useState<AdType>("BUY");
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const emptyForm: Ad = {
    id: "",
    type: activeTab,
    price: "",
    paymentMethods: [],
    maxTime: "15 mins",
    maxAmount: "",
    balance: 0,
    status: "ACTIVE"
  };

  const [form, setForm] = useState<Ad>(emptyForm);

  const canCreateAd = !ads.find(a => a.type === activeTab);

  const handlePaymentToggle = (method: string) => {
    setForm(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const autoStatusCheck = (ad: Ad): Ad => {
    const maxAmt = Number(ad.maxAmount);
    if (ad.balance < maxAmt) {
      return { ...ad, status: "PAUSED" };
    }
    return ad;
  };

  const saveAd = () => {
    let updatedAd = autoStatusCheck(form);

    if (editingAd) {
      setAds(prev => prev.map(a => a.id === editingAd.id ? updatedAd : a));
      setEditingAd(null);
    } else {
      setAds(prev => [...prev, { ...updatedAd, id: Date.now().toString() }]);
    }
    setForm({ ...emptyForm, type: activeTab });
  };

  const editAd = (ad: Ad) => {
    setEditingAd(ad);
    setForm(ad);
  };

  const toggleStatus = (id: string) => {
    setAds(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        if (a.balance < Number(a.maxAmount)) return a; // can't activate if low balance
        return { ...a, status: a.status === "ACTIVE" ? "PAUSED" : "ACTIVE" };
      })
    );
  };

  const updateBalance = (id: string, amount: number) => {
    setAds(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        const newBalance = a.balance + amount;
        return autoStatusCheck({ ...a, balance: newBalance });
      })
    );
  };

  const currentAd = ads.find(a => a.type === activeTab);

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">My Trading Ads</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["BUY", "SELL"] as AdType[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setForm({ ...emptyForm, type: tab });
              setEditingAd(null);
            }}
            className={`flex-1 py-2 rounded-xl font-medium ${
              activeTab === tab ? "bg-blue-600" : "bg-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="text-sm text-yellow-400 mb-4">
        Only 1 BUY ad and 1 SELL ad allowed
      </div>

      {/* Existing Ad Card */}
      {currentAd && !editingAd && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">{currentAd.type} Ad</h2>
            <span className={`text-xs px-2 py-1 rounded ${
              currentAd.status === "ACTIVE" ? "bg-green-600" : "bg-red-600"
            }`}>
              {currentAd.status}
            </span>
          </div>

          <p className="text-sm">💰 Price: ${currentAd.price}</p>
          <p className="text-sm">📦 Max Trade: ${currentAd.maxAmount}</p>
          <p className="text-sm">💳 {currentAd.paymentMethods.join(", ")}</p>
          <p className="text-sm">⏱ Time Limit: {currentAd.maxTime}</p>
          <p className="text-sm">🏦 Balance: ${currentAd.balance}</p>

          {currentAd.balance < Number(currentAd.maxAmount) && (
            <p className="text-xs text-red-400">
              Low balance — Ad automatically paused
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <button onClick={() => editAd(currentAd)} className="flex-1 bg-blue-600 py-2 rounded-xl">Edit</button>
            <button onClick={() => toggleStatus(currentAd.id)} className="flex-1 bg-zinc-700 py-2 rounded-xl">Pause/Resume</button>
          </div>

          {/* Demo Balance Controls */}
          <div className="flex gap-2 mt-2">
            <button onClick={() => updateBalance(currentAd.id, 50)} className="flex-1 bg-green-700 py-1 rounded">+50</button>
            <button onClick={() => updateBalance(currentAd.id, -50)} className="flex-1 bg-red-700 py-1 rounded">-50</button>
          </div>
        </div>
      )}

      {/* Create / Edit Form */}
      {(canCreateAd || editingAd) && (
        <div className="space-y-3 bg-zinc-900 p-4 rounded-xl">

          <input
            type="number"
            placeholder="Price per unit"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full p-3 rounded bg-black"
          />

          <input
            type="number"
            placeholder="Max amount per trade"
            value={form.maxAmount}
            onChange={e => setForm({ ...form, maxAmount: e.target.value })}
            className="w-full p-3 rounded bg-black"
          />

          <input
            type="number"
            placeholder="Available balance for this ad"
            value={form.balance}
            onChange={e => setForm({ ...form, balance: Number(e.target.value) })}
            className="w-full p-3 rounded bg-black"
          />

          {/* Payment Methods */}
          <div>
            <p className="text-sm mb-1">Payment Methods</p>
            <div className="flex flex-wrap gap-2">
              {["UPI", "Bank", "PayPal", "USDT"].map(method => (
                <button
                  key={method}
                  onClick={() => handlePaymentToggle(method)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    form.paymentMethods.includes(method)
                      ? "bg-blue-600"
                      : "bg-zinc-800"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <select
            value={form.maxTime}
            onChange={e => setForm({ ...form, maxTime: e.target.value })}
            className="w-full p-3 rounded bg-black"
          >
            <option>15 mins</option>
            <option>30 mins</option>
            <option>45 mins</option>
            <option>1 hour</option>
          </select>

          <button
            onClick={saveAd}
            className="w-full bg-green-600 py-3 rounded-xl font-semibold"
          >
            {editingAd ? "Update Ad" : `Create ${activeTab} Ad`}
          </button>
        </div>
      )}
    </div>
  );
}
