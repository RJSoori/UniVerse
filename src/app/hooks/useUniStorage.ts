import { useState, useEffect } from "react";

export function useUniStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));

            // Notify other components (like the Dashboard) to update instantly
            window.dispatchEvent(new Event("local-storage-update"));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    };

    // listen for local-storage-update events so multiple components stay in sync
    useEffect(() => {
        const handler = () => {
            try {
                const item = window.localStorage.getItem(key);
                setStoredValue(item ? JSON.parse(item) : initialValue);
            } catch (error) {
                console.error(`Error syncing ${key}:`, error);
            }
        };
        window.addEventListener("local-storage-update", handler);
        return () => window.removeEventListener("local-storage-update", handler);
    }, [key, initialValue]);

    return [storedValue, setValue] as const;
}