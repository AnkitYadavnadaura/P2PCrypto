'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateListing(){
  const [title,setTitle]=useState('Sell USDT');
  const [price,setPrice]=useState(100.0);
  const router = useRouter();
  async function submit(e:any){
    e.preventDefault();
    await axios.post('/api/orders', { title, amount_crypto: 10, crypto_symbol: 'USDT', price_value: price });
    router.push('/dashboard');
  }
  return (
    <form onSubmit={submit}>
      <h2>Create Listing</h2>
      <div>
        <label>Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} />
      </div>
      <div>
        <label>Price (INR)</label>
        <input type="number" value={price} onChange={e=>setPrice(parseFloat(e.target.value))} />
      </div>
      <button type="submit">Create</button>
    </form>
  )
}
