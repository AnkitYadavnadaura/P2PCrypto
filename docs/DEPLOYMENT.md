# Production Deployment Process

## 1) Prerequisites
- Postgres database (managed recommended).
- Pusher app credentials.
- Worldchain RPC endpoint.
- Deployed `P2PPartialEscrow` contract address.
- A strong `INDEXER_SECRET`.

## 2) Configure environment variables
Set all variables from `.env.example` in your deployment platform secrets.

## 3) Build-time verification
Run locally (or in CI):

```bash
npm ci
npm run build
```

## 4) Deploy app (Vercel recommended)
1. Connect repo to Vercel.
2. Set all env vars (Production + Preview).
3. Deploy branch/tag.

## 5) Post-deploy health check
Verify:

```bash
curl -s https://<your-domain>/api/health
```

Expect:
- `ok: true`
- `db: "up"`
- `missing_env: []`

## 6) Enable reconciliation schedule
Call reconcile endpoint every 30-60 seconds from a scheduler/worker:

```bash
curl -X POST "https://<your-domain>/api/reconcile" \
  -H "Content-Type: application/json" \
  -H "x-indexer-secret: $INDEXER_SECRET" \
  -d '{"checkpointName":"p2p-reconcile"}'
```

Recommended scheduler options:
- Vercel Cron + serverless function
- Cloudflare Cron Trigger
- GitHub Actions scheduled workflow

## 7) Go-live checklist
- Contract audit report approved.
- Fuzz/invariant tests green.
- Staging load test passed.
- Backup/restore drill passed.
- Alerting configured for `/api/health` and reconcile failures.
