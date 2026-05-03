/**
 * User-scoped localStorage helpers for non-hook callers.
 *
 * Storage layout:
 *   - Authenticated:   `universe:<userId>:<rawKey>`
 *   - Unauthenticated: writes are skipped, reads return null.
 *
 * The `theme` key (and any other genuinely global preference) is NOT scoped here
 * — callers using a global key should hit `localStorage` directly or use a
 * dedicated helper.
 */

const SCOPE_PREFIX = "universe";

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export function scopedKey(userId: number | string | null | undefined, rawKey: string): string | null {
  if (userId === null || userId === undefined || userId === "") return null;
  return `${SCOPE_PREFIX}:${userId}:${rawKey}`;
}

export function getItemScoped(userId: number | string | null | undefined, rawKey: string): string | null {
  if (!canUseStorage()) return null;
  const key = scopedKey(userId, rawKey);
  if (!key) return null;

  // One-time migration: copy legacy unscoped value to scoped slot, then delete legacy.
  const scoped = window.localStorage.getItem(key);
  if (scoped !== null) return scoped;

  const legacy = window.localStorage.getItem(rawKey);
  if (legacy !== null) {
    try {
      window.localStorage.setItem(key, legacy);
      window.localStorage.removeItem(rawKey);
    } catch {
      // ignore — migration is best-effort
    }
    return legacy;
  }

  return null;
}

export function setItemScoped(
  userId: number | string | null | undefined,
  rawKey: string,
  value: string,
): void {
  if (!canUseStorage()) return;
  const key = scopedKey(userId, rawKey);
  if (!key) return;
  window.localStorage.setItem(key, value);
}

export function removeItemScoped(userId: number | string | null | undefined, rawKey: string): void {
  if (!canUseStorage()) return;
  const key = scopedKey(userId, rawKey);
  if (!key) return;
  window.localStorage.removeItem(key);
}
