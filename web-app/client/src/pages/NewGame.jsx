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
import config from "../constants/config";
import useGameStore from "../stores/gameStore";
import useNewGameLogic from "../hooks/useNewGameLogic";
import useCardIds from "../hooks/useCardIds";
import useWallet from "../hooks/useWallet";
import useUserStore from "../stores/userStore";
import AddCartelaModal from "../components/ui/AddCartelaModal";
import { BINGO_PATTERNS, META_PATTERNS } from "../utils/patterns";
import { formatPatternName } from "../utils/gameUtils";
import LowBalanceAlert from "../components/ui/LowBalanceAlert";

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

  const { cardIds, isLoading: cardIdsLoading } = useCardIds();
  const { refreshWallet } = useWallet();
  const [isBalanceLow, setIsBalanceLow] = useState(false);
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
    showCutAmount,
    toggleCutAmount,
    handleStartGame,
    handleClearSelections,
    handleRefreshCards,
    gameId,
    lastGameId,
    handleContinuePrevious,
    previousCartela,
  } = useNewGameLogic({
    cartela,
    setCartela,
    setTotalBet,
    setTotalWin,
    setTotalHouseProfit,
    setGameData,
    setCardIds: setStoreCardIds,
  });

  const [showSelectedCount, setShowSelectedCount] = useState(false);

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
const displayGameId =
  gameId && gameId !== 0
    ? lastGameId
    : lastGameId + 1;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#111827",
        color: "#fff",
      }}
    >
      <style>{blinkAnimation}</style>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          backgroundColor: "#f6f6f6",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 0.5,
          mb: 0,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ height: { xs: "30px", sm: "40px" }, display: "flex", alignItems: "center" }}>
          <img
            src="/images/bingo.png"
            alt="BINGO"
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </Box>
        <Box
          sx={{
            mt: 2,
            paddingLeft: "70px",
          }}
        >
          <Typography
            sx={{
              color: "#374151",
              fontSize: "1.6rem",
              fontWeight: "bold",
            }}
          >
            Call us: {config.phoneNumber}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* Cut Amount Toggle & Selector (Discreet in Header) */}
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
                  {[
                    0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75,
                    80,
                  ].map((val) => (
                    <option key={val} value={val}>
                      {val}%
                    </option>
                  ))}
                </select>
                <button
                  onClick={toggleCutAmount}
                  style={{ background: "none", border: "none", color: "#1d4ed8", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                >
                  <FaEye size={18} />
                </button>
              </Box>
            ) : (
              <button
                onClick={toggleCutAmount}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                title="Show Cut %"
              >
                <FaEyeSlash size={18} />
              </button>
            )}
          </Box>

          {/* Selected Count Toggle & Register Button Group */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                bgcolor: "#1d4ed8",
                color: "#fff",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.1)" },
              }}
              onClick={() => setShowSelectedCount(!showSelectedCount)}
            >
              {showSelectedCount ? (
                <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                  {cartela.length}
                </Typography>
              ) : (
                <FaEye size={16} />
              )}
            </Box>

            <button
              onClick={() => setAddModalOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#374151",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
              }}
            >
              Register New Card
            </button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <LowBalanceAlert onStatusChange={setIsBalanceLow} />

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
          Round {displayGameId}
        </Typography>

        {/* Main content - Two columns */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 350px" },
            gap: 4,
            alignItems: "start",
          }}
        >
          {/* Left panel: Card grid */}
          <Box
            sx={{
              p: 0,
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
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#218838")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#28a745")}
                >
                  <FaSync className={isLoading ? "animate-spin" : ""} size={16} />
                  Reload
                </button>

                <button
                  onClick={handleContinuePrevious}
                  disabled={isLoading || !previousCartela || previousCartela.length === 0}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ffde21",
                    color: "#000",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: (isLoading || !previousCartela || previousCartela.length === 0) ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: (!previousCartela || previousCartela.length === 0) ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (previousCartela && previousCartela.length > 0) {
                      e.currentTarget.style.backgroundColor = "#ffde15";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (previousCartela && previousCartela.length > 0) {
                      e.currentTarget.style.backgroundColor = "#ffde21";
                    }
                  }}
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
                  gridTemplateColumns: "repeat(17, 1fr)",
                  gap: "2px",
                  width: "100%",
                  maxWidth: "1100px",
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
                        fontWeight: "400",
                        fontFamily: "serif",
                        fontSize: "1.4rem",
                        cursor: "pointer",
                        transition: "all 0.1s ease-in-out",
                        border: "1.5px solid #fbbf24",
                        background: isSelected
                          ? "radial-gradient(circle at 35% 35%, #fbbf24 0%, #d97706 60%, #92400e 100%)"
                          : "radial-gradient(circle at 40% 40%, #7e0105 0%, #3e0101 40%, #000 100%)",
                        boxShadow: isSelected
                          ? "0 0 12px rgba(251, 191, 36, 0.9), inset 0 0 8px rgba(255, 255, 255, 0.4)"
                          : "inset -1px -1px 4px rgba(0,0,0,0.8)",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
                        outline: "none",
                        position: "relative",
                        zIndex: isSelected ? 5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background =
                            "radial-gradient(circle at 30% 30%, #fffbeb 0%, #fbbf24 40%, #d97706 100%)";
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.zIndex = "10";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background =
                            "radial-gradient(circle at 40% 40%, #7e0105 0%, #3e0101 40%, #000 100%)";
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.zIndex = "1";
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
          <Box
            sx={{
              visibility: cartela.length > 0 ? "visible" : "hidden",
              width: "350px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 1,
            }}
          >
            {/* Selected cards header */}
            <Typography
              sx={{
                fontWeight: "bold",
                color: "#fff",
                fontSize: "1.75rem",
                lineHeight: 1,
                mb: 1,
                maxWidth: "250px",
                whiteSpace: "pre-wrap",
              }}
            >
              {"ካርድ ቁጥዎት መመዝገቡን ይመልከቱ"}
            </Typography>

            {/* Selected cards display - matching the balls style */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 1,
              }}
            >
              {cartela.map((cardId) => (
                <Box
                  key={cardId}
                  sx={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "400",
                    fontFamily: "serif",
                    fontSize: "1.75rem",
                    cursor: "pointer",
                    border: "2px solid #fbbf24",
                    background: "radial-gradient(circle at 35% 35%, #fbbf24 0%, #d97706 60%, #92400e 100%)",
                    boxShadow: "0 0 15px rgba(251, 191, 36, 0.4)",
                    transition: "all 0.2s",
                  }}
                  onClick={() => handleRemoveCard(cardId)}
                >
                  {cardId}
                </Box>
              ))}
            </Box>

            {/* Stake selector */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ color: "#fff", fontSize: "1.5rem", minWidth: 20 }}>በ</Typography>
              <select
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value))}
                style={{
                  backgroundColor: "#fff",
                  color: "#000",
                  fontSize: "1.5rem",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                {[
                  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300,
                  400, 500,
                ].map((amount) => (
                  <option key={amount} value={amount}>
                    {amount}ብር
                  </option>
                ))}
              </select>
            </Box>

            {/* Pattern selection */}
            <Box sx={{ width: "100%" }}>
              <select
                value={primaryPattern}
                onChange={(e) => setPrimaryPattern(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#fff",
                  color: "#000",
                  fontSize: "1.5rem",
                  padding: "4px 8px",
                  borderRadius: "2px",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                {allPatterns.map((pattern) => (
                  <option key={pattern} value={pattern}>
                    {formatPatternName(pattern)}
                  </option>
                ))}
              </select>
            </Box>


            {/* Action buttons */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <button
                onClick={handleStartGame}
                disabled={isLoading || cartela.length === 0 || isBalanceLow}
                style={{
                  width: "100%",
                  backgroundColor: isBalanceLow ? "#4b5563" : "#0000ff",
                  color: "white",
                  fontSize: "1.75rem",
                  fontWeight: "bold",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: (isLoading || cartela.length === 0 || isBalanceLow) ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                  opacity: isBalanceLow ? 0.6 : 1,
                }}
              >
                PLAY
              </button>
              <button
                onClick={handleClearSelections}
                className="text-gray-400 hover:text-white transition text-sm underline text-right"
              >
                ማጥፋት
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
