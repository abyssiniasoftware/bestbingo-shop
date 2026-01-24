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
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
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
  lockedCards,
  setLockedCards,
  calledNumbers,
  BINGO_PATTERNS,
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
{isWinner && openModal && (
  <Confetti
    width={window.innerWidth}
    height={200}
    numberOfPieces={120}
    gravity={0.15}
    recycle={false}
  />
)}

      {/* TOP STATUS BAR */}
<Box
  sx={{
    bgcolor: isWinner ? "#16a34a" : "#fff",
    color: isWinner?"#fff":"#dc2626",
    py: 1.2,
    px: 2,
    textAlign: "center",
    position: "relative",
    borderBottom: "4px solid #fff",
  }}
>
  {/* CARD NUMBER */}
  <Typography
    sx={{
      fontSize: "1.8rem",
      fontWeight: "bold",
      lineHeight: 1.2,
    }}
  >
    Card No: {cardIdInput}
  </Typography>

  {/* STATUS */}
  <Typography
    sx={{
      fontSize: "1.1rem",
      fontWeight: "bold",
      mt: 0.3,
      letterSpacing: "0.5px",
      animation: isWinner ? "blinkFadeIn 0.8s ease-in-out" : "none",
    }}
  >
    {isWinner ? "🎉 WINNER!" : "❌ NO BINGO"}
  </Typography>

  {/* PATTERN NAMES */}
  {isWinner && winningPatterns.length > 0 && (
    <Typography
      sx={{
        fontSize: "0.95rem",
        mt: 0.3,
        opacity: 0.95,
      }}
    >
      {winningPatterns.join(" • ")}
    </Typography>
  )}
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
          {/* Bottom Action Buttons */}
<Box
  sx={{
    display: "flex",
    gap: 2,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    mt: 1,
  }}
>
  {/* CLOSE BUTTON */}
  <Button
    onClick={handleCloseModal}
    startIcon={<CloseIcon />}
    sx={{
      minWidth: 140,
      px: 3,
      py: 1,
      fontSize: "1rem",
      fontWeight: "bold",
      textTransform: "none",
      borderRadius: "999px",
      color: "#1f2937",
      background: "linear-gradient(180deg, #fde68a, #facc15)",
      border: "2px solid #000",
      boxShadow: "0 4px 0 #000",
      transition: "all 0.15s ease",
      "&:hover": {
        background: "linear-gradient(180deg, #facc15, #eab308)",
        transform: "translateY(-1px)",
        boxShadow: "0 6px 0 #000",
      },
      "&:active": {
        transform: "translateY(2px)",
        boxShadow: "0 2px 0 #000",
      },
    }}
  >
    Close
  </Button>

  {/* BLOCK BUTTON */}
  <Button
    onClick={handleKickPlayer}
    disabled={lockedCards.includes(cardIdInput)}
    startIcon={<BlockIcon />}
    sx={{
      minWidth: 160,
      px: 4,
      py: 1,
      fontSize: "1rem",
      fontWeight: "bold",
      textTransform: "none",
      borderRadius: "999px",
      color: "#fff",
      background: "linear-gradient(180deg, #ef4444, #dc2626)",
      border: "2px solid #000",
      boxShadow: "0 4px 0 #000",
      transition: "all 0.15s ease",
      "&:hover": {
        background: "linear-gradient(180deg, #dc2626, #b91c1c)",
        transform: "translateY(-1px)",
        boxShadow: "0 6px 0 #000",
      },
      "&:active": {
        transform: "translateY(2px)",
        boxShadow: "0 2px 0 #000",
      },
      "&.Mui-disabled": {
        background: "#9ca3af",
        color: "#f3f4f6",
        borderColor: "#6b7280",
        boxShadow: "none",
      },
    }}
  >
    Block
  </Button>
</Box>

        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WinnerDialog;
