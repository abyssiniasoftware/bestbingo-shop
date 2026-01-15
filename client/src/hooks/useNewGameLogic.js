import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import apiService from "../api/apiService";

const useNewGameLogic = ({
  cartela,
  setCartela,
  setTotalBet,
  setTotalWin,
  setTotalHouseProfit,
  setGameData,
  setCardIds,
}) => {
  const [betAmount, setBetAmount] = useState(
    () => parseInt(localStorage.getItem("betAmount")) || 10,
  );
  const [useDropdown, setUseDropdown] = useState(
    () => JSON.parse(localStorage.getItem("useDropdown")) || false,
  );
  const [cutAmount, setCutAmount] = useState(35);
  const [lastGameId, setLastGameId] = useState(0);
  const [previousCartela, setPreviousCartela] = useState(() => {
    const stored = localStorage.getItem("previousGameCartela");
    return stored ? JSON.parse(stored) : [];
  });
  const [cartelaInput, setCartelaInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [houseProfit, setHouseProfit] = useState(0);
  const [showHouseProfitInfo, setShowHouseProfitInfo] = useState(
    () => JSON.parse(localStorage.getItem("showHouseProfitInfo")) || false,
  );
  const [showTotalStakeInfo, setShowTotalStakeInfo] = useState(
    () => JSON.parse(localStorage.getItem("showTotalStakeInfo")) || false,
  );
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(
    () => JSON.parse(localStorage.getItem("showSensitiveInfo")) || false,
  );
  const [showCutAmount, setShowCutAmount] = useState(
    () => JSON.parse(localStorage.getItem("showCutAmount")) || false,
  );
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(
    () => JSON.parse(localStorage.getItem("isSummaryExpanded")) || true,
  );
  const [showCardCount, setShowCardCount] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(
    () => localStorage.getItem("selectedBackground") || "default",
  );
  const [bonusAmount, setBonusAmount] = useState(() => {
    const stored = localStorage.getItem("bonusAmount");
    return stored ? parseInt(stored) : 0;
  });
  const [bonusPattern, setBonusPattern] = useState(() => {
    const stored = localStorage.getItem("bonusPattern");
    return stored || "";
  });

  const navigate = useNavigate();
  const location = useLocation();
  const gameId = location.state?.gameId;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Fetch cut amount from backend on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!userId || !token) return;
      try {
        setIsLoading(true);
        const [cutResp, gameResp] = await Promise.all([
          apiService.getCutAmountSetting(userId, token),
          apiService.fetchGameDetails(userId, token).catch(() => null),
        ]);

        setCutAmount(cutResp.cutAmount || 35);
        if (gameResp && gameResp.gameId) {
          setLastGameId(gameResp.gameId);
          if (gameResp.cartela && Array.isArray(gameResp.cartela)) {
            const lastCards = gameResp.cartela.map(String);
            setPreviousCartela(lastCards);
            localStorage.setItem("previousGameCartela", JSON.stringify(lastCards));
          }
        }
      } catch {
        toast.error("Failed to fetch initial settings");
        setCutAmount(35);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [userId, token]);

  // Update cut amount on backend when changed
  useEffect(() => {
    const updateCutAmount = async () => {
      if (!userId || !token) return;
      try {
        setIsLoading(true);
        const response = await apiService.updateCutAmountSetting(
          userId,
          cutAmount,
          token,
        );
        if (response.cutAmount !== cutAmount) {
          setCutAmount(response.cutAmount); // Sync with backend response
          // toast.warn("Cut amount synced with server value");
        } else {
          // toast.success("Cut amount updated successfully");
        }
      } catch {
        toast.error("Failed to update cut amount");

        // Fetch current value from backend to ensure consistency
        try {
          const response = await apiService.getCutAmountSetting(userId, token);
          setCutAmount(response.cutAmount || 35);
        } catch (fetchError) {
          console.error(
            "Error fetching cut amount after failed update:",
            fetchError.message,
          );
          setCutAmount(35);
        }
      } finally {
        setIsLoading(false);
      }
    };
    // Only update if cutAmount is not the initial default value
    if (cutAmount >= 0 && cutAmount <= 100) {
      updateCutAmount();
    }
  }, [cutAmount, userId, token]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("betAmount", betAmount);
    localStorage.setItem("useDropdown", JSON.stringify(useDropdown));
    localStorage.setItem(
      "showSensitiveInfo",
      JSON.stringify(showSensitiveInfo),
    );
    localStorage.setItem(
      "isSummaryExpanded",
      JSON.stringify(isSummaryExpanded),
    );
    localStorage.setItem(
      "showHouseProfitInfo",
      JSON.stringify(showHouseProfitInfo),
    );
    localStorage.setItem(
      "showTotalStakeInfo",
      JSON.stringify(showTotalStakeInfo),
    );
    localStorage.setItem("showCutAmount", JSON.stringify(showCutAmount));
    localStorage.setItem("selectedBackground", selectedBackground);
    localStorage.setItem("bonusAmount", bonusAmount.toString());
    localStorage.setItem("bonusPattern", bonusPattern);
  }, [
    betAmount,
    useDropdown,
    showSensitiveInfo,
    isSummaryExpanded,
    showHouseProfitInfo,
    showTotalStakeInfo,
    showCutAmount,
    selectedBackground,
    bonusAmount,
    bonusPattern,
  ]);

  // Calculate winAmount, houseProfit, and update store
  useEffect(() => {
    const cutPercentage = cutAmount / 100;
    const betAmountFloat = parseFloat(betAmount);
    const totalStake = betAmountFloat * cartela.length;

    // Logic: Math.floor for house profit, round is totalStake - houseProfit
    const calculatedHouseProfit = Math.floor(totalStake * cutPercentage);
    const calculatedWinAmount = totalStake - calculatedHouseProfit;

    setWinAmount(calculatedWinAmount.toFixed(0));
    setHouseProfit(calculatedHouseProfit.toFixed(0));
    setTotalBet(totalStake);
    setTotalWin(calculatedWinAmount);
    setTotalHouseProfit(calculatedHouseProfit);
  }, [
    cutAmount,
    betAmount,
    cartela,
    setTotalBet,
    setTotalWin,
    setTotalHouseProfit,
  ]);

  const handleCardIdClick = (clickedCardId) => {
    const cardIdString = clickedCardId.toString();
    if (!cartela.includes(cardIdString)) {
      setCartela([...cartela, cardIdString]);
    } else {
      setCartela(cartela.filter((cardId) => cardId !== cardIdString));
    }
  };

  const isCartelaInputValid = () => {
    if (!cartelaInput) return false;
    return !cartela.includes(cartelaInput);
  };

  const handleCartelaInput = () => {
    if (!cartelaInput) {
      toast.error("Invalid Cartela ID");
      setCartelaInput("");
      return;
    }
    if (cartela.includes(cartelaInput)) {
      toast.warn("Card already selected");
      setCartelaInput("");
      return;
    }
    setCartela([...cartela, cartelaInput]);
    setCartelaInput("");
  };

  const handleCartelaKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCartelaInput();
    }
  };

  const handleStartGame = async () => {
    if (cartela.length < 1) {
      toast.error("Select at least 1 cards to start the game");
      return;
    }
    setIsLoading(true);
    try {
      let payload = {
        houseId: localStorage.getItem("houseId"),
        userId: localStorage.getItem("userId"),
        stakeAmount: betAmount,
        numberOfPlayers: cartela.length,
        cutAmountPercent: cutAmount,
        cartela,
      };
      if (gameId) {
        payload = { ...payload, gameId };
      }

      const response = await apiService.createGame(
        payload,
        localStorage.getItem("token"),
      );
      localStorage.removeItem("lockedCards");
      localStorage.removeItem("calledNumbers");
      localStorage.removeItem("recentCalls");
      localStorage.removeItem("currentNumber");
      localStorage.removeItem("previousNumber");
      localStorage.removeItem("callCount");
      localStorage.removeItem("hasGameStarted");

      // Save previous cartela for next game
      localStorage.setItem("previousGameCartela", JSON.stringify(cartela));
      setPreviousCartela(cartela);

      setGameData({ ...response, cartela });
      navigate(`/game/${betAmount}/${cartela.length}/${winAmount}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSelections = () => {
    setCartela([]);
    setBonusAmount(0);
    setBonusPattern("");
    localStorage.removeItem("bonusAmount");
    localStorage.removeItem("bonusPattern");
    toast.info("Selections cleared");
  };

  const toggleSensitiveInfo = () => setShowSensitiveInfo((prev) => !prev);
  const toggleCutAmount = () => setShowCutAmount((prev) => !prev);
  const toggleCardCount = () => setShowCardCount((prev) => !prev);
  const handleBackgroundChange = (event) => {
    setSelectedBackground(event.target.value);
    localStorage.setItem("selectedBackground", event.target.value);
  };
  const handleRefreshCards = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem("cachedCardIds"); // Clear cache
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        throw new Error("User not authenticated");
      }
      const data = await apiService.fetchCardIds(userId, token);
      const sortedData = data.sort((a, b) => parseInt(a) - parseInt(b));
      setCardIds(sortedData); // Update cardIds in game store
      localStorage.setItem("cachedCardIds", JSON.stringify(sortedData)); // Re-cache
      toast.success("Card IDs refreshed successfully");
    } catch (error) {
      toast.error(error.message || "Failed to refresh card IDs");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRefreshCutAmount = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        throw new Error("User not authenticated");
      }
      const response = await apiService.getCutAmountSetting(userId, token);
      setCutAmount(response.cutAmount || 35);
      toast.success("Cut amount refreshed successfully");
    } catch (error) {
      toast.error(error.message || "Failed to refresh cut amount");
      setCutAmount(35);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinuePrevious = () => {
    if (previousCartela && previousCartela.length > 0) {
      setCartela(previousCartela);
      toast.success(`${previousCartela.length} cards restored from previous game`);
    } else {
      toast.info("No previous game cards found");
    }
  };

  return {
    handleRefreshCards,
    handleRefreshCutAmount,
    handleBackgroundChange,
    selectedBackground,
    betAmount,
    setBetAmount,
    useDropdown,
    setUseDropdown,
    cutAmount,
    setCutAmount,
    cartelaInput,
    setCartelaInput,
    isLoading,
    setIsLoading,
    winAmount,
    houseProfit,
    showHouseProfitInfo,
    setShowHouseProfitInfo,
    showTotalStakeInfo,
    setShowTotalStakeInfo,
    showSensitiveInfo,
    setShowSensitiveInfo,
    showCutAmount,
    setShowCutAmount,
    isSummaryExpanded,
    setIsSummaryExpanded,
    showCardCount,
    setShowCardCount,
    handleCardIdClick,
    handleCartelaInput,
    handleCartelaKeyDown,
    isCartelaInputValid,
    handleStartGame,
    handleClearSelections,
    toggleSensitiveInfo,
    toggleCutAmount,
    toggleCardCount,
    bonusAmount,
    setBonusAmount,
    bonusPattern,
    setBonusPattern,
    lastGameId,
    handleContinuePrevious,
    previousCartela,
  };
};

export default useNewGameLogic;
