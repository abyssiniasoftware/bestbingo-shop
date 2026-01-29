import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import { FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

import useGameStore from "../stores/gameStore";
import useNewGameLogic from "../hooks/useNewGameLogic";
import useCardIds from "../hooks/useCardIds";
import useWallet from "../hooks/useWallet";
import useUserStore from "../stores/userStore";
import AddCartelaModal from "../components/ui/AddCartelaModal";
import { BINGO_PATTERNS, META_PATTERNS } from "../utils/patterns";
import { formatPatternName } from "../utils/gameUtils";

// import LowBalanceAlert from "../components/ui/LowBalanceAlert";
import { ready } from "../voice/utilVoice";

const blinkAnimation = `
  @keyframes blinker {
    50% { opacity: 0; }
  }
`;

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

  const { cardIds } = useCardIds();
  const { refreshWallet } = useWallet();
  const [isBalanceLow, setIsBalanceLow] = useState(false);
  const { userId, walletData } = useUserStore();
  const [showWallet, setShowWallet] = useState(false);
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
    showCutAmount,
    toggleCutAmount,
    handleStartGame,
    handleClearSelections,
    handleRefreshCards,
    isConfirmed,
    setIsConfirmed,
    showAllCards,
    setShowAllCards,
    bonusChecked,
    setBonusChecked,
    freeHitChecked,
    setFreeHitChecked,
    winAmount,
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
    setIsConfirmed(false); // Reset confirmation on change
    const cardIdString = cardId.toString();
    if (!cartela.includes(cardIdString)) {
      setCartela([...cartela, cardIdString]);
    } else {
      setCartela(cartela.filter((id) => id !== cardIdString));
    }
  };

  const handleConfirm = () => {
    if (cartela.length === 0) return;
    const audio = new Audio(ready);
    audio.play().catch(e => console.error("Error playing audio:", e));
    setIsConfirmed(true);
  };

  const filteredCardIds = showAllCards
    ? cardIds
    : cardIds.filter(id => parseInt(id) <= 100);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f0f2f5",
        color: "#333",
      }}
    >
      <style>{blinkAnimation}</style>

      {/* Header - Kept as is as requested */}
      <Box
        sx={{
          display: "flex",
          backgroundColor: "#f6f6f6",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 0.5,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ height: { xs: "30px", sm: "40px" }, display: "flex", alignItems: "center" }}>
          <span className="new-game-header-text-gradient">
            <span className="header-d">Dallol</span>
            {' '}
            Bin
            <span className="header-i">g</span>
            o!
          </span>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showCutAmount ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "#374151", fontSize: "0.85rem", fontWeight: "bold" }}>Cut:</Typography>
                <select
                  value={cutAmount}
                  onChange={(e) => setCutAmount(parseInt(e.target.value))}
                  style={{
                    backgroundColor: "#fff",
                    color: "#000",
                    fontSize: "0.85rem",
                    padding: "1px 4px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    fontWeight: "bold",
                    outline: "none",
                  }}
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((val) => (
                    <option key={val} value={val}>{val}%</option>
                  ))}
                </select>
                <button onClick={toggleCutAmount} style={{ background: "none", border: "none", color: "#1d4ed8", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                  <FaEye size={18} />
                </button>
              </Box>
            ) : (
              <button onClick={toggleCutAmount} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                <FaEyeSlash size={18} />
              </button>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showWallet ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: isBalanceLow ? "#ef4444" : "#374151", fontSize: "1.1rem", fontWeight: "bold", fontFamily: "poetsen" }}>
                  {walletData?.package || 0} Birr
                </Typography>
                <button onClick={() => setShowWallet(false)} style={{ background: "none", border: "none", color: "#1d4ed8", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                  <FaEye size={20} />
                </button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "#9ca3af", fontSize: "1.1rem", fontWeight: "bold", fontFamily: "poetsen" }}>Wallet</Typography>
                <button onClick={() => setShowWallet(true)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                  <FaEyeSlash size={20} />
                </button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ margin: "20px auto", padding: "0 20px" }}>
        {/**
         * <LowBalanceAlert onStatusChange={setIsBalanceLow} />
         */}

        <Box sx={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
          p: 2
        }}>
          {/* Form Header Section */}
          <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>New Game</Typography>

          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mb: 3,
            backgroundColor: "#fcfcfc",
            p: 1.5,
            borderRadius: "8px",
            border: "1px solid #f0f0f0"
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "0.9rem" }}>Game:</Typography>
              <input readOnly value={lastGameId + 1} style={{ width: "100px", padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "0.9rem" }}>Bet Birr:</Typography>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                style={{ width: "100px", padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "0.9rem" }}>No. of players:</Typography>
              <input readOnly value={cartela.length} style={{ width: "100px", padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "0.9rem" }}>Win Birr:</Typography>
              <input readOnly value={winAmount} style={{ width: "100px", padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px" }} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.9rem" }}>Bonus:</Typography>
              <input type="checkbox" checked={bonusChecked} onChange={(e) => setBonusChecked(e.target.checked)} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.9rem" }}>Free Hit:</Typography>
              <input type="checkbox" checked={freeHitChecked} onChange={(e) => setFreeHitChecked(e.target.checked)} />
            </Box>

            <select
              value={primaryPattern}
              onChange={(e) => setPrimaryPattern(e.target.value)}
              style={{
                backgroundColor: "#f3f4f6",
                color: "#333",
                fontSize: "0.9rem",
                padding: "4px 12px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontWeight: "500",
              }}
            >
              {allPatterns.map((pattern) => (
                <option key={pattern} value={pattern}>
                  {formatPatternName(pattern)}
                </option>
              ))}
            </select>
          </Box>

          {/* Card Grid */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(20, 1fr)",
            gap: "4px",
            mb: 3,
            p: 1,
            backgroundColor: "#fff"
          }}>
            {filteredCardIds.map((cardId) => {
              const isSelected = cartela.includes(cardId.toString());
              return (
                <button
                  key={cardId}
                  onClick={() => handleCardClick(cardId)}
                  style={{
                    aspectRatio: "1.2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected ? "#8b0000" : "#d1d5db",
                    color: isSelected ? "#fff" : "#333",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                >
                  {cardId}
                </button>
              );
            })}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 1 }}>
            {isConfirmed ? (
              <button
                onClick={handleStartGame}
                disabled={isLoading || isBalanceLow}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#8b0000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  cursor: (isLoading || isBalanceLow) ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Starting..." : "Start"}
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={cartela.length === 0}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#8b0000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  cursor: cartela.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Confirm
              </button>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <button
                onClick={() => setShowAllCards(!showAllCards)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#8b0000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {showAllCards ? "Show 1-100" : "100-200"}
              </button>
              <button
                onClick={handleClearSelections}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#8b0000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
            </Box>
          </Box>
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
    </Box>
  );
};

export default NewGame;
