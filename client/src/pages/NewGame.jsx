import React, { useState, useEffect } from "react";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { FaSync, FaPlay, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

import useGameStore from "../stores/gameStore";
import useNewGameLogic from "../hooks/useNewGameLogic";
import useCardIds from "../hooks/useCardIds";
import useWallet from "../hooks/useWallet";

import { backgroundOptions } from "../constants/constants";
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

  const { wallet } = useWallet();
  const { cardIds, isLoading: cardIdsLoading, refreshCards } = useCardIds();

  // Pattern selection state
  const [primaryPattern, setPrimaryPattern] = useState(() => {
    const stored = localStorage.getItem("primaryPattern");
    return stored || "oneLine";
  });
  const [secondaryPattern, setSecondaryPattern] = useState(() => {
    const stored = localStorage.getItem("secondaryPattern");
    return stored || "";
  });
  const [patternLogic, setPatternLogic] = useState(() => {
    const stored = localStorage.getItem("patternLogic");
    return stored === "AND" || stored === "OR" ? stored : "OR";
  });

  const {
    betAmount,
    setBetAmount,
    useDropdown,
    setUseDropdown,
    cutAmount,
    setCutAmount,
    cartelaInput,
    setCartelaInput,
    isLoading,
    winAmount,
    showCutAmount,
    showCardCount,
    selectedBackground,
    handleBackgroundChange,
    handleStartGame,
    handleClearSelections,
    handleRefreshCards,
    handleRefreshCutAmount,
    isCartelaInputValid,
    handleCartelaInput,
    handleCartelaKeyDown,
    toggleCutAmount,
    toggleCardCount,
    bonusAmount,
    setBonusAmount,
    bonusPattern,
    setBonusPattern,
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
    localStorage.setItem("secondaryPattern", secondaryPattern);
    localStorage.setItem("patternLogic", patternLogic);
  }, [primaryPattern, secondaryPattern, patternLogic]);

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
        <button
          onClick={() => { }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold transition transform hover:scale-105"
        >
          ⊙ Register New Card
        </button>
      </Box>

      {/* Round Header */}
      <Typography
        sx={{
          textAlign: "center",
          color: "#dc2626",
          fontWeight: "bold",
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          mb: 2,
        }}
      >
        Round 1
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
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography sx={{ fontWeight: "bold", color: "#9ca3af" }}>
              ካርድ ቁጥሮች
            </Typography>
            <button
              onClick={handleRefreshCards}
              disabled={isLoading}
              className={`p-2 rounded-full transition ${isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
            </button>
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
                    className={`card-oval ${isSelected ? "selected" : ""}`}
                    style={{
                      width: "100%",
                      aspectRatio: "1.25",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: isSelected
                        ? "2px solid #fbbf24"
                        : "2px solid #b45309",
                      background: isSelected
                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        : "#1f2937",
                      color: isSelected ? "white" : "#9ca3af",
                      fontSize: "0.875rem",
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
            ካርድ ቁጥሮች መመዝገቡን ይመልከቱ
          </Typography>

          {/* Selected cards display */}
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
            {cartela.length === 0 ? (
              <Typography sx={{ color: "#6b7280", fontStyle: "italic" }}>
                ምንም ካርድ አልተመረጠም
              </Typography>
            ) : (
              cartela.map((cardId) => (
                <Box
                  key={cardId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    background: "#f59e0b",
                    color: "white",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {cardId}
                  <button
                    onClick={() => handleRemoveCard(cardId)}
                    className="hover:text-red-200 transition"
                  >
                    <FaTimes size={12} />
                  </button>
                </Box>
              ))
            )}
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
            <Typography sx={{ color: "#9ca3af" }}>በ</Typography>
            <select
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value))}
              className="bg-gray-700 text-white rounded px-3 py-2 focus:outline-none"
              style={{ flex: 1 }}
            >
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 400, 500].map(
                (amount) => (
                  <option key={amount} value={amount}>
                    {amount} ብር
                  </option>
                )
              )}
            </select>
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
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
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

          {/* Secondary pattern (optional) */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#9ca3af" }}>ሁለተኛ ፓተርን (ምርጫ)</InputLabel>
            <Select
              value={secondaryPattern}
              onChange={(e) => setSecondaryPattern(e.target.value)}
              sx={{
                bgcolor: "#374151",
                color: "#fff",
                borderRadius: "8px",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
              }}
            >
              <MenuItem value="">
                <em>ምንም</em>
              </MenuItem>
              {allPatterns.map((pattern) => (
                <MenuItem key={pattern} value={pattern}>
                  {formatPatternName(pattern)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Pattern logic (AND/OR) */}
          {secondaryPattern && (
            <FormControl fullWidth>
              <Select
                value={patternLogic}
                onChange={(e) => setPatternLogic(e.target.value)}
                sx={{
                  bgcolor: "#374151",
                  color: "#fff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
                }}
              >
                <MenuItem value="OR">ወይም (OR)</MenuItem>
                <MenuItem value="AND">እና (AND)</MenuItem>
              </Select>
            </FormControl>
          )}

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
              ውሸት ሽልማት
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
      </Box>
    </Box>
  );
};

export default NewGame;
