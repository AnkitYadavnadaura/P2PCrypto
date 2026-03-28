import { NextResponse } from "next/server";

const store = new Map<string, { expiresAt: number; payload: unknown }>();

export function getIdempotencyResponse(key: string) {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return NextResponse.json(hit.payload);
}

export function setIdempotencyResponse(key: string, payload: unknown, ttlMs = 60_000) {
  store.set(key, { expiresAt: Date.now() + ttlMs, payload });
}
