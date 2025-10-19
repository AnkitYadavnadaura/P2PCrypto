'use client';
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';

export default function ChatBox({ orderId }: { orderId: string }){
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  useEffect(()=> {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const ch = pusher.subscribe('order-' + orderId);
    ch.bind('message:new', (d:any)=> setMessages(prev=>[...prev,d]));
    return ()=> pusher.disconnect();
  }, [orderId]);

  async function send(){
    if(!text) return;
    await axios.post('/api/events', { type:'chat', orderId, text });
    setText('');
  }
  return (
    <div>
      <div style={{minHeight:120, border:'1px solid #ccc', padding:8}}>
        {messages.map((m,i)=>(<div key={i}>{m.sender||'user'}: {m.text}</div>))}
      </div>
      <div>
        <input value={text} onChange={e=>setText(e.target.value)} />
        <button onClick={send}>Send</button>
      </div>
    </div>
  )
}
