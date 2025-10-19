'use client';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';

const fetcher = (url: string) => axios.get(url).then(r=>r.data);

export default function Dashboard(){
  const { data: orders } = useSWR('/api/orders', fetcher);
  return (
    <div>
      <h2>Dashboard</h2>
      <p><Link href="/create-listing">Create Listing</Link></p>
      <h3>Active Orders</h3>
      <ul>
        {orders?.length ? orders.map((o:any)=>(
          <li key={o.id}>{o.id} — {o.status} — {o.amount_crypto} {o.crypto_symbol}</li>
        )) : <li>No orders yet</li>}
      </ul>
    </div>
  )
}
