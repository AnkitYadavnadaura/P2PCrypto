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

  const emptyForm: Ad = {
    type: activeTab,
    price: "",
    paymentMethods: [],
    maxTime: "15 mins",
    maxAmount: "",
    balance: 0,
  };

  const [form, setForm] = useState<Ad>(emptyForm);

  /* =========================
     READ WALLET FROM STORAGE
     ========================= */
  useEffect(() => {
    const stored = localStorage.getItem("WalletAd");
    if (stored) {
      setWalletAddress(stored);
    }
  }, []);

  /* =========================
     TAB SWITCH
     ========================= */
  const switchTab = (tab: AdType) => {
    setActiveTab(tab);
    setEditingAd(null);
    setForm({ ...emptyForm, type: tab });
  };

  /* =========================
     EDIT MODE
     ========================= */
  const startEdit = (ad: Ad) => {
    setEditingAd(ad);
    setForm(ad);
    setActiveTab(ad.type);
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

    if (!form.price || !form.maxAmount) {
      alert("Price and max amount required");
      return;
    }

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

    const isEdit = Boolean(editingAd?.id);
    const url = isEdit
      ? `/api/listing/${editingAd!.id}`
      : `/api/listing`;

    const method = isEdit ? "PATCH" : "POST";

    try {
      setLoading(true);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Request failed");
        return;
      }

      alert(isEdit ? "Ad updated successfully" : "Ad created successfully");

      // reset state
      setEditingAd(null);
      setForm({ ...emptyForm, type: activeTab });

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

      {/* FORM */}
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
          disabled={loading}
          className="w-full bg-green-600 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : editingAd
              ? "Update Ad"
              : `Create ${activeTab} Ad`}
        </button>
      </div>
    </div>
  );
}
