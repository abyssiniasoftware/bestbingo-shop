import { create } from "zustand";
import { isTokenValid, clearAuthData } from "../services/authService";

// Initialize state from sessionStorage
const initialState = {
  user: null,
  userId: sessionStorage.getItem("userId") || null,
  role: sessionStorage.getItem("role") || null,
  houseId: sessionStorage.getItem("houseId") || null,
  enableDynamicBonus:
    sessionStorage.getItem("enableDynamicBonus") === "true" || false,
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
  // Initialize from sessionStorage on app start
  initializeFromStorage: () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const role = sessionStorage.getItem("role");
    const houseId = sessionStorage.getItem("houseId");
    const enableDynamicBonus = sessionStorage.getItem("enableDynamicBonus") === "true";

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

      // Persist to sessionStorage
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("houseId", houseId);
      sessionStorage.setItem("enableDynamicBonus", String(enableDynamicBonus));

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
