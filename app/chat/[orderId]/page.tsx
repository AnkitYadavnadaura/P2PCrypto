'use client';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
import { useParams } from 'next/navigation';

export default function ChatPage(){
  const params = useParams();
  const orderId = params?.orderId;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  useEffect(()=> {
    const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!PUSHER_KEY || !PUSHER_CLUSTER) {
  throw new Error("Pusher env vars are missing");
}

const pusher = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
});

    const channel = pusher.subscribe('order-' + orderId);
    channel.bind('message:new', (data:any)=>{
      setMessages(prev=>[...prev, data]);
    });
    return ()=> { pusher.disconnect(); }
  }, [orderId]);

  async function send(){
    if(!text) return;
    await axios.post('/api/events', { type:'chat', orderId, text });
    setText('');
  }

  return (
    <div>
      <h2>Chat — Order {orderId}</h2>
      <div style={{border:'1px solid #ddd', padding:8, minHeight:200}}>
        {messages.map((m,i)=>(<div key={i}><strong>{m.sender||'user'}:</strong> {m.text}</div>))}
      </div>
      <div>
        <input value={text} onChange={e=>setText(e.target.value)} />
        <button onClick={send}>Send</button>
      </div>
    </div>
  )
}
