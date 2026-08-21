import { apiFetch } from "../../../shared/api/client";

const DASHBOARD_API_BASE = "/api/dashboard";

export interface DashboardPreferencesPayload {
  layoutJson: string | null;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request to ${path} failed with ${response.status}: ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function getDashboardPreferences(): Promise<DashboardPreferencesPayload> {
  return requestJson<DashboardPreferencesPayload>(`${DASHBOARD_API_BASE}/preferences`);
}

export function saveDashboardPreferences(
  layoutJson: string,
): Promise<DashboardPreferencesPayload> {
  return requestJson<DashboardPreferencesPayload>(`${DASHBOARD_API_BASE}/preferences`, {
    method: "PUT",
    body: JSON.stringify({ layoutJson }),
  });
}
