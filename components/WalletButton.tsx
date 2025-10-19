'use client';
import { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { buildSigninMessage } from '../lib/minikit';

export default function WalletButton(){
  const [token, setToken] = useState<string | null>(null);

  async function signIn(){
    try {
      // basic ethers provider (MetaMask)
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const wallet = await signer.getAddress();
      const nonceResp = await axios.post('/api/auth', { action:'nonce', wallet });
      const message = buildSigninMessage(nonceResp.data.nonce);
      const signature = await signer.signMessage(message);
      const verify = await axios.post('/api/auth', { action:'verify', wallet, signature, message });
      setToken(verify.data.token);
      localStorage.setItem('p2p_token', verify.data.token);
    } catch (err:any) {
      alert('Sign-in failed: ' + err.message);
    }
  }

  return <button onClick={signIn}>{ token ? 'Signed in' : 'Sign in with wallet' }</button>
}
