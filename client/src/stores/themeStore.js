//stores/themeStore.js
import { create } from "zustand";

const useThemeStore = create((set) => ({
  darkMode: true,
  theme: "dark",
  toggleTheme: () =>
    set((state) => ({
      darkMode: !state.darkMode,
      theme: state.darkMode ? "light" : "dark",
    })),
  setTheme: (theme) => set({ theme }),
}));

export default useThemeStore;