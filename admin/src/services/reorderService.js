import axios from "axios";

const API_URL = "http://localhost:9000/v1/api";

const getConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("atoken")}`,
  },
});

export const reorderService = {
  getReorderRequests: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/medicines/reorder-requests`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reorder requests:", error);
      return [];
    }
  },

  approveReorder: async (requestId) => {
    try {
      const response = await axios.post(
        `${API_URL}/medicines/reorder-requests/${requestId}/approve`,
        {},
        getConfig()
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkStock: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/medicines/stock-status`,
        getConfig()
      );
      return response.data;
    } catch (error) {
      console.error("Error checking stock:", error);
      return { reorderNeeded: false, lowStockItems: [] };
    }
  },
};
