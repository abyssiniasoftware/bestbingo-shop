import axios from "axios";

const apiService = {
  fetchSuperStats: async (month) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/stats/super`,
        {
          headers: { "x-auth-token": token },
          params: month ? { month } : {},
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch super admin stats"
      );
    }
  },
  getCutAmountSetting: async (cashierId, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/cut-amount/${cashierId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch cut amount setting"
      );
    }
  },

  updateCutAmountSetting: async (cashierId, cutAmount, token) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_APP_API_URL}/api/cut-amount/${cashierId}`,
        { cutAmount },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update cut amount setting"
      );
    }
  },
  fetchWalletData: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/me`,
        {
          headers: { "x-auth-token": token },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch wallet data"
      );
    }
  },
  fetchCardIds: async (userId, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/bingo-card/${userId}/card-ids`,
        {
          headers: { "x-auth-token": token },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch card IDs"
      );
    }
  },
  createGame: async (payload, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/game/create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create bingo game"
      );
    }
  },
  fetchCardNumbers: async (cardId, userId, token) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_URL
        }/api/user/user-card-bycardId/${userId}/${cardId}`,
        { headers: { "x-auth-token": token } }
      );
      if (!response.data.cards || response.data.cards.length === 0) {
        throw new Error("No card data found");
      }
      const card = response.data.cards[0];
      const numbers = [];
      ["b", "i", "n", "g", "o"].forEach((prefix) => {
        for (let i = 1; i <= 5; i++) {
          numbers.push(card[`${prefix}${i}`]);
        }
      });
      return numbers;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch card numbers"
      );
    }
  },
  fetchCartelaData: async (cardId, userId, token) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_URL
        }/api/bingo-card/${userId}/${cardId}`,
        { headers: { "x-auth-token": token } }
      );
      if (response.status !== 200) throw new Error("Failed to fetch cartela");
      const data = response.data;
      const formattedData = {};
      ["b", "i", "n", "g", "o"].forEach((prefix) => {
        for (let i = 1; i <= 5; i++) {
          const key = `${prefix}${i}`;
          const row = i.toString();
          formattedData[row] = formattedData[row] || {};
          formattedData[row][key] = data[key];
        }
      });
      return formattedData;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch cartela data"
      );
    }
  },
  fetchGameDetails: async (userId, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/game/last/${userId}`,
        { headers: { "x-auth-token": token } }
      );
      if (response.status !== 200)
        throw new Error("Failed to fetch game details");
      const game = response.data;
      if (!game.houseId || !game.gameId || !game.cartela) {
        throw new Error("Incomplete game details");
      }
      return game;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch game details"
      );
    }
  },
  declareWinner: async (houseId, gameId, winnerCardId, token) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/api/game/update-winner`,
        { houseId, gameId, winnerCardId },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      if (response.status !== 200) throw new Error("Failed to declare winner");
      return true;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to declare winner"
      );
    }
  },
  awardBonus: async (cashierId, gameId, houseId, bonusAmount, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/game/award`,
        { cashierId, gameId, houseId, bonusAmount },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      if (response.status !== 201) throw new Error("Failed to award bonus");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to award bonus");
    }
  },
  fetchActiveDynamicBonus: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/game/active-dynamic`,
        {
          headers: { "x-auth-token": token },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch dynamic bonus"
      );
    }
  },
  markBonusInactive: async (houseId, cashierId, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/game/mark-inactive`,
        { houseId, cashierId },
        {
          headers: { "x-auth-token": token },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to mark bonus inactive"
      );
    }
  },
  fetchUserDetails: async (userId, token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/me`,
        {
          headers: { "x-auth-token": token },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user details"
      );
    }
  },
  // Update getCashiers to support search
  getCashiers: async (token, { search = "" } = {}) => {
    const params = new URLSearchParams({ search }).toString();
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/user/cashiers?${params}`,
      {
        headers: { "x-auth-token": token },
        method: "GET",
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch cashiers");
    }
    return response.json();
  },

  // Existing updateDynamicBonus
  updateDynamicBonus: async (userId, enableDynamicBonus, token) => {
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/user/${userId}/dynamic-bonus`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ enableDynamicBonus }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update dynamic bonus");
    }
    return response.json();
  },
  createBingoCard: async (cardData, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/bingo-card/create`,
        cardData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create bingo card"
      );
    }
  },
  bulkUploadCards: async (userId, cardsData, token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/user/bulk-upload`,
        { userId, cardsData },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to upload bulk cards"
      );
    }
  },
  deleteBingoCard: async (userId, cardId, token) => {
    try {
      const response = await axios.delete(
        `${
          import.meta.env.VITE_APP_API_URL
        }/api/bingo-card/${userId}/${cardId}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete bingo card"
      );
    }
  },
  updateBingoCard: async (userId, cardId, cardData, token) => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_APP_API_URL
        }/api/bingo-card/${userId}/${cardId}`,
        cardData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update bingo card"
      );
    }
  },
};

export default apiService;
