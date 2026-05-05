import { clearAuthStorage, getToken, notifyUnauthorized } from "../../auth/tokenStore";

const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;

let warnedAboutFallback = false;

function getBackendUrl(): string {
  if (configuredBackendUrl) return configuredBackendUrl.replace(/\/$/, "");

  if (import.meta.env.PROD) {
    throw new Error("VITE_BACKEND_URL is required in production builds.");
  }

  if (!warnedAboutFallback) {
    console.warn("VITE_BACKEND_URL is not set; falling back to http://localhost:8080 for development.");
    warnedAboutFallback = true;
  }

  return "http://localhost:8080";
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearAuthStorage();
    notifyUnauthorized();
  }

  return response;
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.error || data?.message || `Request failed with ${response.status}`;
  } catch {
    return `Request failed with ${response.status}`;
  }
}
