import axios from 'axios';

const API_URL = 'http://localhost:8080/api/focus';

export const focusApi = {
  // Saves the completed session to MySQL for a specific user
  saveSession: async (minutes: number, userId: string) => {
    const sessionData = {
      totalMinutes: minutes, 
      userId: userId, 
      focusDate: new Date().toISOString().split('T')[0] 
    };
    return await axios.post(`${API_URL}/save`, sessionData);
  },

  // Fetches the analytics data specifically for the logged-in user
  getAnalytics: async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/analytics`, {
        params: { userId: userId } // This sends the ID as a query parameter
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return [];
    }
  }
};