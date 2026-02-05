'use client';

import { useEffect, useState } from "react";

type AdType = "BUY" | "SELL";

interface Ad {
  id?: string;
  type: AdType;
  price: string;
  paymentMethods: string[];
  maxTime: string;
  maxAmount: string;
  balance: number;
}

export default function AdsDashboard() {
  const [activeTab, setActiveTab] = useState<AdType>("BUY");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [showForm, setShowForm] = useState(true);

  

  const emptyForm: Ad = {
    type: activeTab,
    price: "",
    paymentMethods: [],
    maxTime: "15 mins",
    maxAmount: "",
    balance: 0,
  };

  const [form, setForm] = useState<Ad>(emptyForm);
  const currentAd = ads.find(ad => ad.type === activeTab);




  /* =========================
     READ WALLET FROM STORAGE
     ========================= */
  useEffect(() => {
    const stored = localStorage.getItem("WalletAd");
    if (stored) {
      setWalletAddress(stored);
    }
  }, []);
  useEffect(() => {
  if (!walletAddress) return;

  fetch(`/api/listing?wallet=${walletAddress}`)
    .then(res => res.json())
    .then(data => {
      setAds(data.listings || []);
    })
    .catch(err => console.error(err));
}, [walletAddress]);


  /* =========================
     TAB SWITCH
     ========================= */
  const switchTab = (tab: AdType) => {
    setActiveTab(tab);
    setEditingAd(null);
    setForm({ ...emptyForm, type: tab });
    setShowForm(!ads.find(a => a.type === tab));
  };

  /* =========================
     EDIT MODE
     ========================= */
  const startEdit = (ad: Ad) => {
    setEditingAd(ad);
    setForm(ad);
    setActiveTab(ad.type);
    setShowForm(true);
  };
 

  /* =========================
     PAYMENT METHODS
     ========================= */
  const togglePaymentMethod = (method: string) => {
    setForm(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  /* =========================
     SUBMIT (CREATE / UPDATE)
     ========================= */
  const handleSubmit = async () => {
    if (!walletAddress) {
      alert("Wallet not connected");
      return;
    }
    alert("Entering")

    if (!form.price || !form.maxAmount) {
      alert("Price and max amount required");
      return;
    }
    alert("Pass1")
try {
    const payload = {
      walletAddress,
      type: form.type,
      cryptoSymbol: "USDT",
      price: form.price,
      minAmount: "1",
      maxAmount: form.maxAmount,
      balance: form.type === "SELL" ? String(form.balance) : "0",
      paymentMethods: form.paymentMethods,
      maxTimeMinutes: Number(form.maxTime.split(" ")[0]),
    };
    alert("pass2")
    } catch (err) {
  console.error("❌ ERROR WHILE BUILDING PAYLOAD", err);
  alert("Payload error");
}
const payload = {};
    const isEdit = Boolean(editingAd?.id);
    alert("pass3")
    const url = isEdit
      ? `/api/listing/${editingAd!.id}`
      : `/api/listing`;
      alert(url)

    const method = isEdit ? "PATCH" : "POST";

    try {
      setLoading(true);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data)

      if (!res.ok) {
        alert(data.error || "Request failed");
        return;
      }

      alert(isEdit ? "Ad updated successfully" : "Ad created successfully");
      const savedAd = data.listing;

      setAds(prev =>
  prev.map(ad => (ad.id === savedAd.id ? savedAd : ad))
);


      // reset state
      setEditingAd(null);
      setForm({ ...emptyForm, type: activeTab });
      setShowForm(false);

    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">My Trading Ads</h1>

      <p className="text-xs text-green-400 mb-4 break-all">
        Wallet: {walletAddress ?? "Not connected"}
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["BUY", "SELL"] as AdType[]).map(tab => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`flex-1 py-2 rounded-xl font-medium ${
              activeTab === tab ? "bg-blue-600" : "bg-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Ads LIST */}
      {/* ADS LIST */}
<div className="space-y-4 mb-6">
  {ads
    .filter(ad => ad.type === activeTab)
    .map(ad => (
      <div
        key={ad.id}
        className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{ad.type} Ad</h3>
        </div>

        <p className="text-sm mt-2">💰 Price: {ad.price}</p>
        <p className="text-sm">📦 Max: {ad.maxAmount}</p>
        <p className="text-sm">💳 {ad.paymentMethods.join(", ")}</p>
        <p className="text-sm">🏦 Balance: {ad.balance}</p>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => startEdit(ad)}
            className="flex-1 bg-blue-600 py-2 rounded-xl"
          >
            Edit
          </button>
        </div>
      </div>
    ))}

  {ads.filter(ad => ad.type === activeTab).length === 0 && (
    <p className="text-center text-zinc-400 text-sm">
      No {activeTab} ads created yet
    </p>
  )}
</div>


      {/* FORM */}
      {showForm && (
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

        {activeTab === "SELL" && (
          <input
            type="number"
            placeholder="Available balance"
            value={form.balance}
            onChange={e => setForm({ ...form, balance: Number(e.target.value) })}
            className="w-full p-3 rounded bg-black"
          />
        )}

        {/* Payment Methods */}
        <div>
          <p className="text-sm mb-1">Payment Methods</p>
          <div className="flex flex-wrap gap-2">
            {["UPI", "Bank", "Binance Pay"].map(method => (
              <button
                key={method}
                onClick={() => togglePaymentMethod(method)}
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
          onClick={handleSubmit}
          className="w-full bg-green-600 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : editingAd
              ? "Update Ad"
              : `Create ${activeTab} Ad`}
        </button>
      </div>)}
    </div>
  );
}
