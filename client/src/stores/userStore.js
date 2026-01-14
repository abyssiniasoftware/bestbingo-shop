import { create } from "zustand";

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
};

const useUserStore = create((set) => ({
  ...initialState,
  setUser: (userData) =>
    set(() => {
      // Persist to localStorage
      localStorage.setItem("userId", userData?.id || "");
      localStorage.setItem("role", userData?.role || "");
      localStorage.setItem("houseId", userData?.houseId || "");
      localStorage.setItem(
        "enableDynamicBonus",
        String(userData?.enableDynamicBonus || false),
      );
      return {
        user: userData,
        userId: userData?.id,
        role: userData?.role,
        houseId: userData?.houseId,
        enableDynamicBonus: userData?.enableDynamicBonus || false,
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
      // Clear localStorage
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("houseId");
      localStorage.removeItem("token");
      localStorage.removeItem("enableDynamicBonus");
      localStorage.removeItem("tokenExpiration");
      return {
        user: null,
        userId: null,
        role: null,
        houseId: null,
        enableDynamicBonus: false,
        walletData: { package: 0 },
        error: null,
      };
    }),
}));

export default useUserStore;
