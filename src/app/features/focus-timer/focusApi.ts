import { apiFetch } from "../../shared/api/client";

export const focusApi = {
  saveSession: async (minutes: number) => {
    const sessionData = {
      totalMinutes: minutes,
      focusDate: new Date().toISOString().split("T")[0],
    };
    const response = await apiFetch("/api/focus/save", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) throw new Error("Failed to save focus session");
    return response.json();
  },

  getAnalytics: async () => {
    try {
      const response = await apiFetch("/api/focus/analytics");
      if (!response.ok) return [];
      return response.json();
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return [];
    }
  },
};
