'use client';
import {ReactNode , useEffect} from 'react'
import {minikit} from '@worldcoin/minikit-js'

export default function MiniKitProvider({children}:{children: ReactNode}){

useEffect(()=>{
  minikit.install()
},[])
  return <>{children}</>
}
