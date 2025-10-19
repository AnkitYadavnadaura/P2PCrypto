'use client';
import Link from 'next/link';
export default function OrderCard({ order }: { order: any }){
  return (
    <div style={{border:'1px solid #eee', padding:8, marginBottom:8}}>
      <div><strong>Order:</strong> {order.id}</div>
      <div><strong>Amount:</strong> {order.amount_crypto} {order.crypto_symbol}</div>
      <div><strong>Status:</strong> {order.status}</div>
      <div><Link href={'/chat/' + order.id}>Open Chat</Link></div>
    </div>
  )
}
