import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { FaSync, FaPlay, FaTimes, FaEye, FaEyeSlash, FaIdCard } from "react-icons/fa";

import useGameStore from "../stores/gameStore";
import useNewGameLogic from "../hooks/useNewGameLogic";
import useCardIds from "../hooks/useCardIds";
import useWallet from "../hooks/useWallet";
import useUserStore from "../stores/userStore";
import AddCartelaModal from "../components/ui/AddCartelaModal";

import { BINGO_PATTERNS, META_PATTERNS } from "../utils/patterns";
import { formatPatternName } from "../utils/gameUtils";
import "../styles/game-redesign.css";

const NewGame = () => {
  const {
    cartela,
    setCartela,
    setTotalBet,
    setTotalWin,
    setTotalHouseProfit,
    setGameData,
    setCardIds: setStoreCardIds,
  } = useGameStore();

  const { cardIds, isLoading: cardIdsLoading } = useCardIds();
  const { refreshWallet } = useWallet();
  const { userId } = useUserStore();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [primaryPattern, setPrimaryPattern] = useState(() => {
    const stored = localStorage.getItem("primaryPattern");
    return stored || "oneLine";
  });

  const {
    betAmount,
    setBetAmount,
    cutAmount,
    setCutAmount,
    isLoading,
    winAmount,
    showCutAmount,
    toggleCutAmount,
    handleStartGame,
    handleClearSelections,
    handleRefreshCards,
    lastGameId,
  } = useNewGameLogic({
    cartela,
    setCartela,
    setTotalBet,
    setTotalWin,
    setTotalHouseProfit,
    setGameData,
    setCardIds: setStoreCardIds,
  });

  // Common patterns for selection dropdown
  const commonPatterns = [
    "row",
    "column",
    "diagonal",
    "oneLine",
    "fourCorners",
    "innerCorners",
    "innerOrfourCorners",
    "anyTwoHorizontalLine",
    "anyTwoVerticalLine",
    "anyTwoLine",
    "anyThreeLine",
    "anyFourLine",
    "anyFiveLine",
    "plus",
    "xPattern",
    "lPattern",
    "tPattern",
    "uPattern",
    "cross",
    "diamond",
    "postageStamp",
    "bigDiamond",
    "blackout",
    ...Object.keys(META_PATTERNS),
  ];

  const allPatterns = [
    ...commonPatterns,
    ...Object.keys(BINGO_PATTERNS).filter((p) => !commonPatterns.includes(p)),
  ];

  // Save pattern selections to localStorage
  useEffect(() => {
    localStorage.setItem("primaryPattern", primaryPattern);
  }, [primaryPattern]);

  const handleCardClick = (cardId) => {
    const cardIdString = cardId.toString();
    if (!cartela.includes(cardIdString)) {
      setCartela([...cartela, cardIdString]);
    } else {
      setCartela(cartela.filter((id) => id !== cardIdString));
    }
  };

  const handleRemoveCard = (cardId) => {
    setCartela(cartela.filter((id) => id !== cardId));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#111827",
        color: "#fff",
        p: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#fbbf24",
            fontWeight: "bold",
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          BINGO
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold transition transform hover:scale-105 text-sm sm:text-base flex items-center gap-2"
          >
            <FaIdCard /> Register New Card
          </button>
        </Box>
      </Box>

      {/* Round Header */}
      <Typography
        sx={{
          textAlign: "center",
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem" },
          mb: 2,
        }}
      >
        Round {lastGameId + 1}
      </Typography>

      {/* Main content - Two columns */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
        }}
      >
        {/* Left panel: Card grid */}
        <Box
          sx={{
            flex: 2,
            background: "#1f2937",
            borderRadius: "8px",
            p: 2,
          }}
        >
          {/* Card list header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              position: "relative",
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: "bold", fontSize: "1.5rem", color: "#fff" }}>
              ካርድ ቁጥሮች
            </Typography>

            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 2,
              }}
            >
              <button
                onClick={handleRefreshCards}
                disabled={isLoading}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#218838")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#28a745")}
              >
                <FaSync className={isLoading ? "animate-spin" : ""} />
                Reload
              </button>
              <button
                onClick={() => { }}
                disabled={isLoading}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "#ffde21",
                  color: "#000",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffde15")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffde21")}
              >
                በነበረው ጨዋታ ይቅጥሉ
              </button>
            </Box>
          </Box>

          {/* Card grid - oval buttons */}
          {cardIdsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
            </Box>
          ) : cardIds.length === 0 ? (
            <Typography sx={{ color: "#ef4444", textAlign: "center" }}>
              No cards available. Please add some cards first.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(7, 1fr)",
                  sm: "repeat(10, 1fr)",
                  md: "repeat(12, 1fr)",
                  lg: "repeat(17, 1fr)",
                },
                gap: 0.5,
              }}
            >
              {cardIds.map((cardId) => {
                const isSelected = cartela.includes(cardId.toString());
                return (
                  <button
                    key={cardId}
                    onClick={() => handleCardClick(cardId)}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "1.25rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      border: isSelected ? "3px solid #ffde21" : "1px solid #7c2d12",
                      background: isSelected
                        ? "radial-gradient(circle at 35% 35%, #fffbeb 0%, #fbbf24 40%, #d97706 100%)"
                        : "radial-gradient(circle at 35% 35%, #991b1b 0%, #7f1d1d 30%, #000 100%)",
                      boxShadow: isSelected
                        ? "0 0 15px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.5)"
                        : "0 4px 6px rgba(0,0,0,0.5)",
                      transform: isSelected ? "scale(1.1)" : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background =
                          "radial-gradient(circle at 35% 35%, #fffbeb 0%, #fbbf24 40%, #d97706 100%)";
                        e.currentTarget.style.border = "3px solid #ffde21";
                        e.currentTarget.style.boxShadow = "0 0 15px rgba(251, 191, 36, 0.4)";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background =
                          "radial-gradient(circle at 35% 35%, #991b1b 0%, #7f1d1d 30%, #000 100%)";
                        e.currentTarget.style.border = "1px solid #7c2d12";
                        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.5)";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    {cardId}
                  </button>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Right panel: Selection and controls */}
        {cartela.length > 0 && (
          <Box
            sx={{
              flex: 1,
              background: "#1f2937",
              borderRadius: "8px",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Selected cards header */}
            <Typography sx={{ fontWeight: "bold", color: "#9ca3af" }}>
              ካርድ ቁጥሮት መመዝገቡን ይመልከቱ
            </Typography>

            {/* Selected cards display - matching the balls style */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                minHeight: 80,
                p: 2,
                background: "#111827",
                borderRadius: "8px",
                border: "1px solid #374151",
              }}
            >
              {cartela.map((cardId) => (
                <Box
                  key={cardId}
                  sx={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                    cursor: "pointer",
                    border: "2px solid #ffde21",
                    background: "radial-gradient(circle at 35% 35%, #fffbeb 0%, #fbbf24 40%, #d97706 100%)",
                    boxShadow: "0 0 10px rgba(251, 191, 36, 0.4)",
                    transition: "all 0.2s",
                  }}
                  onClick={() => handleRemoveCard(cardId)}
                >
                  {cardId}
                </Box>
              ))}
            </Box>

            {/* Selected count */}
            <Typography sx={{ color: "#9ca3af", textAlign: "center" }}>
              {cartela.length} ካርዶች ተመርጠዋል
            </Typography>

            {/* Bet amount selector */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography sx={{ color: "#9ca3af", minWidth: 60 }}>Stake:</Typography>
              <select
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value))}
                className="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none"
                style={{ flex: 1 }}
              >
                {[
                  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300,
                  400, 500,
                ].map((amount) => (
                  <option key={amount} value={amount}>
                    {amount} ብር
                  </option>
                ))}
              </select>
            </Box>

            {/* Cut amount selector */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography sx={{ color: "#9ca3af", minWidth: 60 }}>Cut %:</Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                {showCutAmount ? (
                  <select
                    value={cutAmount}
                    onChange={(e) => setCutAmount(parseInt(e.target.value))}
                    className="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none"
                    style={{ flex: 1 }}
                  >
                    {[
                      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75,
                      80,
                    ].map((val) => (
                      <option key={val} value={val}>
                        {val}%
                      </option>
                    ))}
                  </select>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: "#374151",
                      height: "40px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b7280",
                      fontSize: "0.875rem",
                    }}
                  >
                    Hidden
                  </Box>
                )}
                <button
                  onClick={toggleCutAmount}
                  className="p-2 text-gray-400 hover:text-white transition"
                  title={showCutAmount ? "Hide Cut %" : "Show Cut %"}
                >
                  {showCutAmount ? <FaEyeSlash /> : <FaEye />}
                </button>
              </Box>
            </Box>

            {/* Pattern selection */}
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel sx={{ color: "#9ca3af" }}>ፓተርን ይምረጡ</InputLabel>
              <Select
                value={primaryPattern}
                onChange={(e) => setPrimaryPattern(e.target.value)}
                sx={{
                  bgcolor: "#374151",
                  color: "#fff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4b5563",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#60a5fa",
                  },
                }}
              >
                {allPatterns.map((pattern) => (
                  <MenuItem key={pattern} value={pattern}>
                    {formatPatternName(pattern)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Win amount display */}
            <Box
              sx={{
                background: "#111827",
                border: "2px solid #fbbf24",
                borderRadius: "8px",
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                ደራሽ
              </Typography>
              <Typography
                sx={{
                  color: "#fbbf24",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                }}
              >
                {winAmount} ብር
              </Typography>
            </Box>


            {/* Action buttons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <button
                onClick={handleClearSelections}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
              >
                ማጥፋት
              </button>
              <button
                onClick={handleStartGame}
                disabled={isLoading || cartela.length === 0}
                className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${isLoading || cartela.length === 0
                  ? "bg-gray-500 cursor-not-allowed text-gray-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                <FaPlay />
                PLAY
              </button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Register Card Modal */}
      <AddCartelaModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        userId={userId}
        onCartelaAdded={() => {
          handleRefreshCards();
          refreshWallet();
        }}
      />
    </Box>
  );
};

export default NewGame;
