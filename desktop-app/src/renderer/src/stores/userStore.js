import { create } from "zustand";
import { isTokenValid, clearAuthData } from "../services/authService";

// Initialize state from localStorage
const initialState = {
  user: null,
  userId: localStorage.getItem("userId") || null,
  role: localStorage.getItem("role") || null,
  houseId: localStorage.getItem("houseId") || null,
  enableDynamicBonus:
    localStorage.getItem("enableDynamicBonus") === "true" || false,
  walletData: { package: 0 },
  error: null,
  isAuthenticated: false,
};

const useUserStore = create((set, get) => ({
  ...initialState,
  // Check if user is authenticated (token exists and valid)
  checkAuth: () => {
    const valid = isTokenValid();
    set({ isAuthenticated: valid });
    return valid;
  },
  // Initialize from localStorage on app start
  initializeFromStorage: () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const houseId = localStorage.getItem("houseId");
    const enableDynamicBonus = localStorage.getItem("enableDynamicBonus") === "true";

    if (token && isTokenValid()) {
      set({
        userId,
        role,
        houseId,
        enableDynamicBonus,
        isAuthenticated: true,
        user: { id: userId, role, houseId },
      });
      return true;
    } else {
      // Token invalid or missing, clear everything
      get().clearUser();
      return false;
    }
  },
  setUser: (userData) =>
    set(() => {
      const userId = userData?.id || userData?._id || "";
      const role = userData?.role || "";
      const houseId = userData?.houseId || "";
      const enableDynamicBonus = userData?.enableDynamicBonus || false;

      // Persist to localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);
      localStorage.setItem("houseId", houseId);
      localStorage.setItem("enableDynamicBonus", String(enableDynamicBonus));

      return {
        user: userData,
        userId: userId,
        role: role,
        houseId: houseId,
        enableDynamicBonus: enableDynamicBonus,
        walletData: { package: userData?.package || 0 },
        isAuthenticated: true,
      };
    }),
  setWalletData: (wallet) =>
    set((state) => ({
      walletData: { ...state.walletData, ...wallet },
    })),
  setWalletBalance: (balance) =>
    set((state) => ({
      walletData: { ...state.walletData, package: balance },
    })),
  setError: (error) => set({ error }),
  clearUser: () =>
    set(() => {
      // Use centralized auth cleanup
      clearAuthData();
      return {
        user: null,
        userId: null,
        role: null,
        houseId: null,
        enableDynamicBonus: false,
        walletData: { package: 0 },
        error: null,
        isAuthenticated: false,
      };
    }),
}));

export default useUserStore;
