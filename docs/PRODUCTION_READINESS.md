# Production Readiness Checklist (Phase 2)

Status: **NOT READY FOR PRODUCTION**

## Smart contract
- [x] Partial-fill listing + order lifecycle implemented.
- [x] Dispute open + admin resolve path implemented.
- [x] Timeout-based auto-cancel implemented.
- [ ] Independent smart-contract audit completed.
- [ ] Invariant/fuzz/property tests completed.
- [ ] Emergency pause + timelock governance design finalized.

## Backend/APIs
- [x] Wallet-cookie auth guard on write routes.
- [x] Order status transition validation.
- [x] Durable idempotency keys on order/payment/listing actions (Postgres-backed).
- [x] Durable rate limiting + abuse controls (Postgres-backed).
- [ ] Durable background workers for retries/webhooks.
- [x] Contract event reconciliation endpoint (`POST /api/reconcile`) with secret auth + checkpoint persistence.

## Security/Compliance
- [ ] KYC/KYB provider integration.
- [ ] AML/sanctions checks and velocity/risk limits.
- [ ] Secrets/KMS/HSM handling policy.
- [ ] Incident response and key rotation runbooks.

## Infra/Operations
- [ ] Staging deployment with production-like load.
- [ ] Monitoring, metrics, alerting dashboards.
- [ ] Database backups + restore drills.
- [ ] Chaos/failure recovery exercises.

## UX / Product
- [ ] Order-room proof upload and moderated dispute UI.
- [ ] Notification system (push/email/in-app).
- [ ] Reputation scoring and anti-fraud signals.
