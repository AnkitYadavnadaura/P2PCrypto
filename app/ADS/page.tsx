'use client';
import { useState } from "react";
import React from "react";

export default function ListNewAd() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    cta: ""
  });

 const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};


  const handleSubmit = () => {
    console.log("Ad Data:", form);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      
      {/* Header */}
      <h1 className="text-xl font-semibold mb-4">
        List New Ad
      </h1>

      {/* Form */}
      <div className="space-y-4">

        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Ad Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-zinc-900 outline-none"
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Ad Description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 rounded-xl bg-zinc-900 outline-none"
        />

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-zinc-900"
        >
          <option value="">Select Category</option>
          <option value="crypto">Crypto</option>
          <option value="gaming">Gaming</option>
          <option value="education">Education</option>
        </select>

        {/* Media Upload */}
        <div className="border border-dashed border-zinc-700 rounded-xl p-4 text-center">
          <p className="text-sm text-zinc-400">
            Upload Image / Video
          </p>
          <input type="file" className="mt-2 text-sm" />
        </div>

        {/* Price */}
        <input
          type="number"
          name="price"
          placeholder="Ad Budget (USD)"
          value={form.price}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-zinc-900 outline-none"
        />

        {/* CTA */}
        <input
          type="text"
          name="cta"
          placeholder="Call to Action (e.g. Install Now)"
          value={form.cta}
          onChange={handleChange}
          className="w-full p-3 rounded-xl bg-zinc-900 outline-none"
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 py-3 rounded-xl font-medium"
        >
          Publish Ad
        </button>

      </div>
    </div>
  );
}
