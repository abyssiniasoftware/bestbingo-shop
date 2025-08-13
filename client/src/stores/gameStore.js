// src/stores/gameStore.js
import { create } from "zustand";

const useGameStore = create((set) => ({
  gameData: null,
  winnerNumbers: [],
  liveResults: [],
  currentNumber: null,
  checkCardId: "",
  modalOpen: false,
  finishedGame: false,
  loading: false,
  error: null,
  totalHouseProfit: 0,
  storedPackage: 0,
  totalWin: 0,
  totalBet: 0,
  cartela: [],
  cardIds: [], // Added cardIds state
  setGameData: (data) => set({ gameData: data }),
  setWinnerNumbers: (numbers) => set({ winnerNumbers: numbers }),
  setLiveResults: (results) => set({ liveResults: results }),
  setCurrentNumber: (number) => set({ currentNumber: number }),
  setCheckCardId: (id) => set({ checkCardId: id }),
  setModalOpen: (open) => set({ modalOpen: open }),
  setFinishedGame: (status) => set({ finishedGame: status }),
  setLoading: (status) => set({ loading: status }),
  setError: (error) => set({ error: error }),
  setTotalHouseProfit: (profit) => set({ totalHouseProfit: profit }),
  setStoredPackage: (pkg) => set({ storedPackage: pkg }),
  setTotalWin: (win) => set({ totalWin: win }),
  setTotalBet: (bet) => set({ totalBet: bet }),
  setCartela: (newCartela) =>
    set((state) => ({
      cartela: Array.isArray(newCartela) ? newCartela : state.cartela,
    })),
  setCardIds: (cardIds) => set({ cardIds }), // Added setter for cardIds
  resetGame: () =>
    set({
      gameData: null,
      winnerNumbers: [],
      liveResults: [],
      currentNumber: null,
      checkCardId: "",
      modalOpen: false,
      finishedGame: false,
      cardIds: [],
    }),
}));

export default useGameStore;
