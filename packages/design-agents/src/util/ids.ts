import { randomUUID } from "node:crypto";

/** Deterministic-ish clock so tests can freeze time. */
let clock: () => Date = () => new Date();

export function setClock(fn: () => Date): void {
  clock = fn;
}

export function now(): string {
  return clock().toISOString();
}

export function uuid(): string {
  return randomUUID();
}

export function shortId(prefix: string): string {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}
