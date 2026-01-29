import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Confetti from "react-confetti";
import { bonus } from "../../voice/utilVoice";
import { formatPatternName } from "../../utils/gameUtils";

const blinkFadeInAnimation = `
  @keyframes blinkFadeIn {
    0% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

// Map pattern types to display names
const getPatternName = (patternType) => {
  if (patternType === "fullCard") return "ሙሉ ካርድ";
  return formatPatternName(patternType);
};

const WinnerDialog = ({
  openModal,
  handleCloseModal,
  cardIdInput,
  cartelaData,
  bingoState,
  patternTypes,
  bonusAwarded,
  bonusAmount,
  isManual,
  declareWinnerManually,
  onNewGameClick,
  playWinnerAudio,
  playLoseAudio,
  lockedCards,
  setLockedCards,
  calledNumbers,
  BINGO_PATTERNS,
  playBlockedAudio,
}) => {
  const theme = useTheme();
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (openModal && bonusAwarded) {
      const playBonusAudio = async () => {
        try {
          const audio = new Audio(bonus);
          await audio.play().catch(() => { });
        } catch {
          // Audio playback failed or was interrupted, ignore
        }
      };
      playBonusAudio();
    }
  }, [openModal, bonusAwarded]);

  if (!cartelaData || !bingoState) return null;

  // Determine if the card is a winner
  const isWinner = patternTypes && patternTypes.length > 0;
  // Get the last called number
  const lastCalledNumber =
    calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null;

  // Get all winning patterns for display
  const winningPatterns = [];
  if (isWinner) {
    if (patternTypes.includes("fullCard")) {
      winningPatterns.push("ሙሉ ካርድ");
    }
    patternTypes.forEach((patternType) => {
      if (patternType !== "fullCard" && BINGO_PATTERNS[patternType]) {
        BINGO_PATTERNS[patternType].forEach((pattern) => {
          if (pattern.every((cell) => bingoState[cell])) {
            const patternName = getPatternName(patternType);
            if (!winningPatterns.includes(patternName)) {
              winningPatterns.push(patternName);
            }
          }
        });
      }
    });
  }

  const getCellStyle = (cell, value) => {
    const isFreeCell = cell === "n3";
    const isCalled =
      isFreeCell ||
      calledNumbers
        .map((num) => parseInt(num, 10))
        .includes(parseInt(value, 10));
    let isWinningCell = false;

    if (isWinner) {
      if (patternTypes.includes("fullCard")) {
        isWinningCell = isCalled;
      } else {
        isWinningCell = patternTypes.some((patternType) =>
          BINGO_PATTERNS[patternType]?.some(
            (pattern) =>
              pattern.includes(cell) && pattern.every((c) => bingoState[c]),
          ),
        );
      }
    }
    const isLastCalled =
      isWinner &&
      !isFreeCell &&
      lastCalledNumber &&
      parseInt(value, 10) === parseInt(lastCalledNumber, 10);

    const cellSize = isVerySmallScreen
      ? "30px"
      : isSmallScreen
        ? "40px"
        : isMediumScreen
          ? "50px"
          : "60px";
    const currentFontSize = isVerySmallScreen
      ? "10px"
      : isSmallScreen
        ? "12px"
        : "14px";

    return {
      width: cellSize,
      height: cellSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      fontWeight: "bold",
      fontSize: currentFontSize,
      bgcolor: isWinningCell ? "#16a34a" : isCalled ? "#dc2626" : "#e5e7eb",
      color: isWinningCell || isCalled ? "#fff" : "#000",
      border: "1px solid #000",
      boxShadow: isWinningCell ? "0 0 8px rgba(22, 163, 74, 0.4)" : "none",
      ...(isLastCalled && {
        animation: "blinkFadeIn 1s ease-in-out infinite",
      }),
    };
  };

  const getHeaderStyle = (letter) => {
    const colors = {
      B: "#FF0000",
      I: "#008000",
      N: "#FFFF00",
      G: "#0000FF",
      O: "#7B499D",
    };
    const cellSize = isVerySmallScreen
      ? "30px"
      : isSmallScreen
        ? "40px"
        : isMediumScreen
          ? "50px"
          : "60px";
    const currentFontSize = isVerySmallScreen
      ? "10px"
      : isSmallScreen
        ? "12px"
        : "14px";

    return {
      width: cellSize,
      height: cellSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      fontWeight: "bold",
      fontSize: currentFontSize,
      bgcolor: colors[letter],
      color: letter === "N" ? "#000" : "#fff",
      border: "1px solid #000",
    };
  };

  const handleKickPlayer = () => {
    if (!lockedCards.includes(cardIdInput)) {
      setLockedCards((prev) => {
        if(playBlockedAudio)playBlockedAudio();
        const updatedLockedCards = [...prev, cardIdInput];
        localStorage.setItem("lockedCards", JSON.stringify(updatedLockedCards));
        return updatedLockedCards;
      });
    }
    handleCloseModal();
  };

  const cellSizeForGridTemplate = isVerySmallScreen
    ? "30px"
    : isSmallScreen
      ? "40px"
      : isMediumScreen
        ? "50px"
        : "60px";

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#fff",
          borderRadius: "4px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          overflow: "hidden",
        },
      }}
    >
      <style>{blinkFadeInAnimation}</style>

      {/* Header Bar */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 1.5,
        borderBottom: "1px solid #e5e7eb",
        bgcolor: "#f9fafb"
      }}>
        <Typography sx={{ fontWeight: "bold", color: "#374151" }}>Bingo</Typography>
        <Button
          onClick={handleKickPlayer}
          disabled={lockedCards.includes(cardIdInput)}
          sx={{
            bgcolor: "#dc2626",
            color: "#fff",
            "&:hover": { bgcolor: "#b91c1c" },
            fontSize: "1rem",
            fontWeight: "bold",
            px: 4,
            py: 0.5,
            borderRadius: "4px",
            textTransform: "none",
            border: "2px solid #000",
            "&.Mui-disabled": { bgcolor: "#9ca3af", color: "#f3f4f6" },
          }}
        >
          ይታሰር
        </Button>
      </Box>

      {/* Blue Card No Bar */}
      <Box
        sx={{
          bgcolor: "#0047ab",
          color: "#fff",
          py: 1,
          textAlign: "center",
          fontSize: "2rem",
          fontWeight: "bold",
          borderBottom: "4px solid #fff"
        }}
      >
        Card No: {cardIdInput}
      </Box>

      <DialogContent sx={{ p: 2, bgcolor: "#f3f4f6" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>

          {/* Grid Container */}
          <Box sx={{
            bgcolor: "#fff",
            p: 1,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            border: "1px solid #9ca3af"
          }}>
            {/* Header Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(5, ${cellSizeForGridTemplate})`,
                gap: "2px",
                mb: "2px",
              }}
            >
              {["B", "I", "N", "G", "O"].map((letter) => (
                <Box key={letter} sx={getHeaderStyle(letter)}>
                  {letter}
                </Box>
              ))}
            </Box>
            {/* 5x5 Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(5, ${cellSizeForGridTemplate})`,
                gap: "2px",
              }}
            >
              {[1, 2, 3, 4, 5].map((row) =>
                ["b", "i", "n", "g", "o"].map((col) => {
                  const cell = `${col}${row}`;
                  const value = cartelaData[row]?.[cell] ?? "N/A";
                  return (
                    <Box key={cell} sx={getCellStyle(cell, value)}>
                      {cell === "n3" ? "free" : value}
                    </Box>
                  );
                }),
              )}
            </Box>
          </Box>

          {/* Bottom Buttons */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", width: "100%" }}>
            {isManual ? (
              <>
                <Button
                  onClick={async () => {
                    if (playWinnerAudio) playWinnerAudio();
                    await declareWinnerManually();
                    handleCloseModal();
                  }}
                  sx={{
                    bgcolor: "#1e7e4e",
                    color: "#fff",
                    border: "2px solid #000",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    textTransform: "none",
                    px: 3,
                    "&:hover": { bgcolor: "#166534" }
                  }}
                >
                  አሸንፏል
                </Button>
                <Button
                  onClick={() => {
                    if (playLoseAudio) playLoseAudio();
                    handleCloseModal();
                  }}
                  sx={{
                    bgcolor: "#d94242",
                    color: "#fff",
                    border: "2px solid #000",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    textTransform: "none",
                    px: 3,
                    "&:hover": { bgcolor: "#991b1b" }
                  }}
                >
                  አላሸነፈም
                </Button>
                <Button
                  onClick={handleCloseModal}
                  sx={{
                    bgcolor: "#f2c144",
                    color: "#000",
                    border: "2px solid #000",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    textTransform: "none",
                    px: 3,
                    "&:hover": { bgcolor: "#eab308" }
                  }}
                >
                  ተጨማሪ ቢንጎ
                </Button>
                <Button
                  onClick={onNewGameClick}
                  sx={{
                    bgcolor: "#3f2b96",
                    color: "#fff",
                    border: "2px solid #000",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    textTransform: "none",
                    px: 3,
                    "&:hover": { bgcolor: "#2e1065" }
                  }}
                >
                  አዲስ ጨዋታ
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCloseModal}
                  sx={{
                    bgcolor: "#f2c144",
                    color: "#000",
                    border: "2px solid #000",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    textTransform: "none",
                    px: 3,
                    "&:hover": { bgcolor: "#eab308" }
                  }}
                >
                  ተጨማሪ ቢንጎ
                </Button>
                <Button
                  onClick={onNewGameClick}
                  sx={{
                    bgcolor: "#3f2b96",
                    color: "#fff",
                    border: "2px solid #000",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    textTransform: "none",
                    px: 3,
                    "&:hover": { bgcolor: "#2e1065" }
                  }}
                >
                  አዲስ ጨዋታ
                </Button>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WinnerDialog;
