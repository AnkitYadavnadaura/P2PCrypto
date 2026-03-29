import { NextResponse } from "next/server";

type CachedResponse = {
  expiresAt: number;
  payload: unknown;
  status: number;
};

const store = new Map<string, CachedResponse>();

export function getIdempotencyResponse(key: string) {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return NextResponse.json(hit.payload, { status: hit.status });
}

export function setIdempotencyResponse(
  key: string,
  payload: unknown,
  options?: { ttlMs?: number; status?: number },
) {
  const ttlMs = options?.ttlMs ?? 60_000;
  const status = options?.status ?? 200;

  store.set(key, {
    expiresAt: Date.now() + ttlMs,
    payload,
    status,
  });
}
