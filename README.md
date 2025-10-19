# P2P MiniApp — Next.js (Vercel) Template

This is a backendless Next.js (App Router) starter for a P2P crypto marketplace:
- Serverless API routes in `app/api/.../route.ts`
- Wallet auth (World MiniKit compatible flow using signature + JWT)
- Orders API (create/list)
- Simple escrow release route (manual trigger)
- Realtime chat via Pusher
- Deployable to Vercel (add env vars in Vercel project)

Quick start:
1. Copy `.env.example` to `.env.local` and fill env vars (or set in Vercel).
2. `npm install`
3. `npm run dev`
4. Deploy to Vercel and set environment variables.

Notes:
- This is a template scaffold — secure key management, production-ready DB pooling, KMS signing, and KYC are not included and must be added before going live.
- Use a serverless-friendly Postgres provider (Neon, Vercel Postgres, etc.).
