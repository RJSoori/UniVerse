import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    getStorageSanitizer,
    sanitizeStorageValue,
    type StorageSanitizer,
} from "../validation";
import { useAuth } from "../../auth/AuthContext";
import { scopedKey } from "../storage/userScopedStorage";

export interface UseUniStorageOptions {
    /**
     * Skip per-user scoping. Use for genuinely shared/public data
     * (e.g. recruiter portal job board, marketplace catalog) that must persist
     * regardless of which student — if any — is logged in.
     */
    shared?: boolean;
}

/**
 * Persisted state hook that scopes keys per authenticated user.
 *
 * Behaviour:
 *  - When a user is signed in, keys are stored under `universe:<userId>:<rawKey>`.
 *    On first read for a given user, an existing legacy unscoped value is
 *    migrated (copied → unscoped key removed) so existing data isn't lost.
 *  - When no user is signed in, the hook returns the initial fallback and
 *    writes are no-ops. This prevents pre-login pages (or background
 *    components) from leaking writes that would later be associated with
 *    whoever logs in next.
 *  - When the active user changes (login/logout), the hook re-reads from the
 *    new effective key so logged-in user A never sees data persisted by user B.
 *  - Pass `{ shared: true }` to opt out of scoping entirely — the raw key is
 *    used and writes are allowed even without an active user. Use this for
 *    public/persona data (recruiter portal posts, shared marketplace data)
 *    that must outlive any single student session.
 *
 * Stability note: `initialValue` is captured into a ref on first render. It's
 * safe (and idiomatic) to pass inline literals like `useUniStorage('todos', [])`
 * — the hook will not re-trigger effects when callers create a new array each
 * render.
 */
export function useUniStorage<T>(
    key: string,
    initialValue: T,
    sanitizer?: StorageSanitizer<T>,
    options: UseUniStorageOptions = {},
) {
    const { shared = false } = options;
    const appliedSanitizer = sanitizer ?? getStorageSanitizer<T>(key);
    const { user } = useAuth();
    const userId = user?.id ?? null;

    // Capture the initial fallback once. If callers pass inline arrays/objects,
    // this prevents render-loop chains (new literal → new callback identity →
    // effect re-runs → setState with a fresh empty array → re-render → repeat).
    const initialValueRef = useRef(initialValue);

    const effectiveKey = useMemo(() => {
        if (shared) return key;
        return scopedKey(userId, key);
    }, [shared, userId, key]);

    // Track the most recent effective key in a ref so the change-listener can
    // ignore events that don't pertain to the current user without needing to
    // depend on userId (which would re-attach the listener every time).
    const effectiveKeyRef = useRef(effectiveKey);
    effectiveKeyRef.current = effectiveKey;

    const readFromStorage = useCallback((): T => {
        const fallback = initialValueRef.current;
        if (!effectiveKey) return fallback;
        try {
            // One-time legacy migration (scoped mode only): if a pre-scoping
            // value lives at the unscoped key and nothing exists at the scoped
            // key yet, move it.
            let raw = window.localStorage.getItem(effectiveKey);
            if (raw === null && !shared && effectiveKey !== key) {
                const legacy = window.localStorage.getItem(key);
                if (legacy !== null) {
                    try {
                        window.localStorage.setItem(effectiveKey, legacy);
                        window.localStorage.removeItem(key);
                    } catch {
                        // best-effort migration
                    }
                    raw = legacy;
                }
            }
            if (raw === null) return fallback;
            const parsed = JSON.parse(raw);
            const sanitized = sanitizeStorageValue(
                key,
                parsed,
                fallback,
                appliedSanitizer,
            );
            if (!sanitized.valid) {
                console.warn(`Invalid persisted data for ${key}; using sanitized fallback.`);
            }
            return sanitized.value;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            try {
                window.localStorage.removeItem(effectiveKey);
            } catch (clearError) {
                console.error(`Error clearing corrupted data for ${key}:`, clearError);
            }
            return fallback;
        }
    }, [appliedSanitizer, effectiveKey, key, shared]);

    const [storedValue, setStoredValue] = useState<T>(() => readFromStorage());

    // Re-sync from storage whenever the effective key changes (login/logout
    // for scoped keys; never changes for shared keys).
    useEffect(() => {
        setStoredValue(readFromStorage());
        // We intentionally only depend on effectiveKey here, not on
        // readFromStorage. readFromStorage is stable across renders for a
        // given effectiveKey/sanitizer pair, but we want a single re-sync
        // per actual key change rather than per callback-identity change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveKey]);

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            setStoredValue((prevValue) => {
                const candidateValue =
                    value instanceof Function ? value(prevValue) : value;
                const sanitized = sanitizeStorageValue(
                    key,
                    candidateValue,
                    initialValueRef.current,
                    appliedSanitizer,
                );

                if (!sanitized.valid) {
                    console.warn(`Rejected invalid write for ${key}; keeping previous value.`);
                    return prevValue;
                }

                // No active user (and not shared): keep state in memory but
                // don't persist — avoids capturing writes that would otherwise
                // pollute whoever logs in next on this browser.
                if (!effectiveKey) {
                    return sanitized.value;
                }

                const serialized = JSON.stringify(sanitized.value);
                window.localStorage.setItem(effectiveKey, serialized);

                queueMicrotask(() => {
                    window.dispatchEvent(new Event("local-storage-update"));
                });
                return sanitized.value;
            });
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }, [appliedSanitizer, effectiveKey, key]);

    // Listen for in-app sync events. Re-read whenever any scoped/shared write
    // happens; we filter using `effectiveKeyRef` so multi-user-aware components
    // don't pick up stale data after logout.
    useEffect(() => {
        const handler = () => {
            const currentKey = effectiveKeyRef.current;
            if (!currentKey) return;
            try {
                const item = window.localStorage.getItem(currentKey);
                if (!item) {
                    setStoredValue(initialValueRef.current);
                    return;
                }
                const parsed = JSON.parse(item);
                const sanitized = sanitizeStorageValue(
                    key,
                    parsed,
                    initialValueRef.current,
                    appliedSanitizer,
                );
                setStoredValue(sanitized.value);
            } catch (error) {
                console.error(`Error syncing ${key}:`, error);
            }
        };
        window.addEventListener("local-storage-update", handler);
        return () => window.removeEventListener("local-storage-update", handler);
    }, [appliedSanitizer, key]);

    return [storedValue, setValue] as const;
}
