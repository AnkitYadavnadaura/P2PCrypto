import Link from 'next/link';
export default function Page(){
  return (
    <div>
      <h2>Welcome to P2P MiniApp</h2>
      <p><Link href="/dashboard">Open Dashboard</Link></p>
    </div>
  )
}
