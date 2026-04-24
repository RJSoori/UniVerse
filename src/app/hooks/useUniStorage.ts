import { useState, useEffect, useCallback } from "react";
import {
    getStorageSanitizer,
    sanitizeStorageValue,
    type StorageSanitizer,
} from "../utils/validation";

export function useUniStorage<T>(
    key: string,
    initialValue: T,
    sanitizer?: StorageSanitizer<T>,
) {
    const appliedSanitizer = sanitizer ?? getStorageSanitizer<T>(key);

    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) {
                return initialValue;
            }
            const parsed = JSON.parse(item);
            const sanitized = sanitizeStorageValue(
                key,
                parsed,
                initialValue,
                appliedSanitizer,
            );
            if (!sanitized.valid) {
                console.warn(`Invalid persisted data for ${key}; using sanitized fallback.`);
            }
            return sanitized.value;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            console.error(`Stored value was:`, window.localStorage.getItem(key));
            // Clear corrupted data
            try {
                window.localStorage.removeItem(key);
            } catch (clearError) {
                console.error(`Error clearing corrupted data for ${key}:`, clearError);
            }
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            setStoredValue((prevValue) => {
                const candidateValue =
                    value instanceof Function ? value(prevValue) : value;
                const sanitized = sanitizeStorageValue(
                    key,
                    candidateValue,
                    initialValue,
                    appliedSanitizer,
                );

                if (!sanitized.valid) {
                    console.warn(`Rejected invalid write for ${key}; keeping previous value.`);
                    return prevValue;
                }

                const serialized = JSON.stringify(sanitized.value);
                window.localStorage.setItem(key, serialized);

                // Defer event dispatch to avoid render phase updates
                queueMicrotask(() => {
                    window.dispatchEvent(new Event("local-storage-update"));
                });
                return sanitized.value;
            });
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
            console.error(`Value to store:`, value);
            // Don't throw - just log the error
        }
    }, [appliedSanitizer, initialValue, key]);

    // listen for local-storage-update events so multiple components stay in sync
    useEffect(() => {
        const handler = () => {
            try {
                const item = window.localStorage.getItem(key);
                if (!item) {
                    setStoredValue(initialValue);
                    return;
                }

                const parsed = JSON.parse(item);
                const sanitized = sanitizeStorageValue(
                    key,
                    parsed,
                    initialValue,
                    appliedSanitizer,
                );
                setStoredValue(sanitized.value);
            } catch (error) {
                console.error(`Error syncing ${key}:`, error);
            }
        };
        window.addEventListener("local-storage-update", handler);
        return () => window.removeEventListener("local-storage-update", handler);
    }, [appliedSanitizer, initialValue, key]);

    return [storedValue, setValue] as const;
}
