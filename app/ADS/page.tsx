'use client'
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AddNewAd() {
  const navigate = useNavigate();

  const [ad, setAd] = useState({
    asset: "",
    type: "sell",
    price: "",
    min: "",
    max: "",
    payment: "",
    terms: ""
  });

  const handleChange = (e) =>
    setAd({ ...ad, [e.target.name]: e.target.value });

  return (
    <div className="max-w-xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Add New Ad</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-zinc-400"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-4">

        <select
          name="asset"
          onChange={handleChange}
          className="w-full p-3 bg-zinc-900 rounded-xl"
        >
          <option value="">Select Asset</option>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
        </select>

        <div className="flex gap-3">
          <button
            onClick={() => setAd({ ...ad, type: "buy" })}
            className={`flex-1 py-2 rounded-xl ${
              ad.type === "buy" ? "bg-green-600" : "bg-zinc-800"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setAd({ ...ad, type: "sell" })}
            className={`flex-1 py-2 rounded-xl ${
              ad.type === "sell" ? "bg-red-600" : "bg-zinc-800"
            }`}
          >
            Sell
          </button>
        </div>

        <input
          name="price"
          placeholder="Price"
          className="w-full p-3 bg-zinc-900 rounded-xl"
          onChange={handleChange}
        />

        <div className="flex gap-3">
          <input
            name="min"
            placeholder="Min Limit"
            className="w-full p-3 bg-zinc-900 rounded-xl"
            onChange={handleChange}
          />
          <input
            name="max"
            placeholder="Max Limit"
            className="w-full p-3 bg-zinc-900 rounded-xl"
            onChange={handleChange}
          />
        </div>

        <select
          name="payment"
          className="w-full p-3 bg-zinc-900 rounded-xl"
          onChange={handleChange}
        >
          <option value="">Payment Method</option>
          <option value="upi">UPI</option>
          <option value="bank">Bank</option>
        </select>

        <textarea
          name="terms"
          placeholder="Terms"
          rows={3}
          className="w-full p-3 bg-zinc-900 rounded-xl"
          onChange={handleChange}
        />

        <button className="w-full bg-blue-600 py-3 rounded-xl">
          Post Ad
        </button>
      </div>
    </div>
  );
}
