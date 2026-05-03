export function readJsonFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Invalid localStorage JSON for ${key}; clearing corrupted value.`, error);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // best-effort cleanup
    }
    return fallback;
  }
}
