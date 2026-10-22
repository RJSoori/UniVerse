import { clearAuthStorage, notifyUnauthorized } from "../../auth/tokenStore";

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

interface ApiFetchInit extends RequestInit {
  /**
   * Set on calls that are themselves an attempt to authenticate (login/register submits).
   * A 401 from one of those is an expected "wrong credentials" business response, not a sign
   * that the current session died - it must not trigger the global logout-and-redirect-to-
   * /signin side effect below, which would otherwise yank recruiters/sellers off their own
   * portal and onto the student sign-in page mid-form.
   */
  skipAuthRedirect?: boolean;
}

export async function apiFetch(path: string, init: ApiFetchInit = {}): Promise<Response> {
  const { skipAuthRedirect, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);

  if (!headers.has("Content-Type") && requestInit.body && !(requestInit.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getBackendUrl()}${path}`, {
    ...requestInit,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && !skipAuthRedirect) {
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
