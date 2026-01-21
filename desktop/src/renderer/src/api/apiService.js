import api from "../utils/api";

const apiService = {
  fetchSuperStats: async (month) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await api.get(`/api/stats/super`, {
        params: month ? { month } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch super admin stats",
      );
    }
  },
  getCutAmountSetting: async (cashierId, token) => {
    try {
      const response = await api.get(`/api/cut-amount/${cashierId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch cut amount setting",
      );
    }
  },

  updateCutAmountSetting: async (cashierId, cutAmount, token) => {
    try {
      const response = await api.patch(`/api/cut-amount/${cashierId}`, {
        cutAmount,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update cut amount setting",
      );
    }
  },
  fetchWalletData: async (token) => {
    try {
      const response = await api.get(`/api/me`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch wallet data",
      );
    }
  },
  fetchCardIds: async (userId, token) => {
    try {
      const response = await api.get(`/api/bingo-card/${userId}/card-ids`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch card IDs",
      );
    }
  },
  createGame: async (payload, token) => {
    try {
      const response = await api.post(`/api/game/create`, payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create bingo game",
      );
    }
  },
  fetchCardNumbers: async (cardId, userId, token) => {
    try {
      const response = await api.get(
        `/api/user/user-card-bycardId/${userId}/${cardId}`,
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
        error.response?.data?.message || "Failed to fetch card numbers",
      );
    }
  },
  fetchCartelaData: async (cardId, userId, token) => {
    try {
      const response = await api.get(`/api/bingo-card/${userId}/${cardId}`);
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
        error.response?.data?.message || "Failed to fetch cartela data",
      );
    }
  },
  fetchGameDetails: async (userId, token) => {
    try {
      const response = await api.get(`/api/game/last/${userId}`);
      if (response.status !== 200)
        throw new Error("Failed to fetch game details");
      const game = response.data;
      if (!game.houseId || !game.gameId || !game.cartela) {
        throw new Error("Incomplete game details");
      }
      return game;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch game details",
      );
    }
  },
  declareWinner: async (houseId, gameId, winnerCardId, token) => {
    try {
      const response = await api.put(`/api/game/update-winner`, {
        houseId,
        gameId,
        winnerCardId,
      });
      if (response.status !== 200) throw new Error("Failed to declare winner");
      return true;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to declare winner",
      );
    }
  },
  awardBonus: async (cashierId, gameId, houseId, bonusAmount, token) => {
    try {
      const response = await api.post(`/api/game/award`, {
        cashierId,
        gameId,
        houseId,
        bonusAmount,
      });
      if (response.status !== 201) throw new Error("Failed to award bonus");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to award bonus");
    }
  },
  fetchActiveDynamicBonus: async (token) => {
    try {
      const response = await api.get(`/api/game/active-dynamic`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch dynamic bonus",
      );
    }
  },
  markBonusInactive: async (houseId, cashierId, token) => {
    try {
      const response = await api.post(`/api/game/mark-inactive`, {
        houseId,
        cashierId,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to mark bonus inactive",
      );
    }
  },
  fetchUserDetails: async (userId, token) => {
    try {
      const response = await api.get(`/api/me`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user details",
      );
    }
  },
  // Update getCashiers to support search
  getCashiers: async (token, { search = "" } = {}) => {
    const params = new URLSearchParams({ search }).toString();
    const response = await api.get(`/api/user/cashiers?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch cashiers");
    }
    return response.json();
  },

  // Existing updateDynamicBonus
  updateDynamicBonus: async (userId, enableDynamicBonus, token) => {
    const response = await api.patch(
      `/api/user/${userId}/dynamic-bonus`,

      { enableDynamicBonus },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update dynamic bonus");
    }
    return response.json();
  },
  createBingoCard: async (cardData, token) => {
    try {
      const response = await api.post(`/api/bingo-card/create`, cardData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create bingo card",
      );
    }
  },
  bulkUploadCards: async (userId, cardsData, token) => {
    try {
      const response = await api.post(`/api/user/bulk-upload`, {
        userId,
        cardsData,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to upload bulk cards",
      );
    }
  },
  deleteBingoCard: async (userId, cardId, token) => {
    try {
      const response = await api.delete(`/api/bingo-card/${userId}/${cardId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete bingo card",
      );
    }
  },
  updateBingoCard: async (userId, cardId, cardData, token) => {
    try {
      const response = await api.put(
        `/api/bingo-card/${userId}/${cardId}`,
        cardData,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update bingo card",
      );
    }
  },
};

export default apiService;
