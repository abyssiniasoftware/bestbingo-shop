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
import bonusAudio from "../../assets/bonus.mp3";
import { formatPatternName } from "../../utils/gameUtils";

const blinkFadeInAnimation = `
  @keyframes blinkFadeIn {
    0% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

// Map pattern types to display names
const getPatternName = (patternType, index) => {
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
  selectedPattern,
  lockedCards,
  setLockedCards,
  calledNumbers,
  BINGO_PATTERNS,
  isGameEnded,
  bonusAwarded,
  bonusAmount,
  handleEndGame,
}) => {
  const theme = useTheme();
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (openModal && bonusAwarded) {
      const playBonusAudio = async () => {
        try {
          const audio = new Audio(bonusAudio);
          await audio.play().catch((error) => {});
        } catch (error) {}
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
        BINGO_PATTERNS[patternType].forEach((pattern, index) => {
          if (pattern.every((cell) => bingoState[cell])) {
            const patternName = getPatternName(patternType, index);
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
              pattern.includes(cell) && pattern.every((c) => bingoState[c])
          )
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
      ? "45px"
      : isMediumScreen
      ? "60px"
      : "70px";
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
      ? "45px"
      : isMediumScreen
      ? "60px"
      : "70px";
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
    ? "45px"
    : isMediumScreen
    ? "60px"
    : "70px";

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "100vw",
          height: { xs: "100vh", sm: "90vh" },
          maxHeight: { xs: "100vh", sm: "90vh" },
          position: "fixed",
          bottom: 0,
          right: 0,
          m: 0,
          bgcolor: "#fefcbf",
          borderRadius: { xs: 0, sm: "12px 12px 0 0" },
          boxShadow: "0 -4px 16px rgba(0,0,0,0.2)",
        },
      }}
    >
      <style>{blinkFadeInAnimation}</style>
      {bonusAwarded && (
        <>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            run={openModal && bonusAwarded}
            colors={["#FFD700", "#FF4500", "#00FF00", "#1E90FF", "#FF69B4"]}
            initialVelocityY={10}
            gravity={0.2}
          />
          <Box
            sx={{
              position: "absolute",
              top: "5%",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: { xs: "18px", sm: "20px", md: "24px" },
              fontWeight: "bold",
              color: "rgba(255, 215, 0, 0.8)",
              WebkitTextStroke: "1px #FFD700",
              background: "linear-gradient(45deg, #FFD700, #FF4500)",
              WebkitBackgroundClip: "text",
              textShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
              animation: "fallAndFade 5s ease-out 1s forwards",
              zIndex: 10,
              "@keyframes fallAndFade": {
                "0%": { transform: "translate(-50%, -100%)", opacity: 0 },
                "20%": { transform: "translate(-50%, 20vh)", opacity: 1 },
                "80%": { transform: "translate(-50%, 80vh)", opacity: 1 },
                "100%": { transform: "translate(-50%, 100vh)", opacity: 0 },
              },
            }}
          >
            ቦነስ {bonusAmount} ብር!
          </Box>
        </>
      )}
      <DialogContent
        sx={{
          bgcolor: "transparent",
          color: "#000",
          p: { xs: 1, sm: 2, md: 3 },
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "flex-end" },
            gap: { xs: 2, md: 3 },
            maxWidth: "800px",
            width: "100%",
            justifyContent: "center",
            pb: { xs: 2, sm: 0 },
          }}
        >
          {/* Grid and Text */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: { xs: "100%", md: "auto" },
              order: { xs: 0, md: 0 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                textAlign: "center",
              }}
            >
              ካርድ {cardIdInput}
            </Typography>
            {isWinner && winningPatterns.length > 0 && (
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  color: "#15803d",
                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                  textAlign: "center",
                }}
              >
                የማሸነፍ ፓተርን(ዎች): {winningPatterns.join(", ")}
              </Typography>
            )}
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: isWinner ? "#15803d" : "#b91c1c",
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                textAlign: "center",
              }}
            >
              {isWinner
                ? `አሸናፊ! ${winningPatterns.length} ፓተርን ተመሳስለዋል`
                : selectedPattern === "anySixLine" ||
                  selectedPattern === "anySevenLine"
                ? "ውስብስብ ፓተርን, እራስዎ ያረጋግጡ"
                : "አሸናፊ አይደለም"}
            </Typography>
            <Box
              sx={{
                maxWidth: {
                  xs: "100%",
                  sm: `calc(5 * ${
                    isSmallScreen ? "45px" : "60px"
                  } + 4 * 2px + 2 * 8px)`,
                  md: `calc(5 * ${
                    isMediumScreen ? "60px" : "70px"
                  } + 4 * 2px + 2 * 12px)`,
                  lg: "calc(5 * 70px + 4 * 2px + 2 * 16px)",
                },
                width: "fit-content",
                bgcolor: "#fff",
                borderRadius: "8px",
                p: { xs: 0.5, sm: 1, md: 1.5, lg: 2 },
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
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
                        {cell === "n3" ? "ነፃ" : value}
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>
          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              alignSelf: { xs: "stretch", md: "flex-end" },
              mb: { md: 2 },
              width: { xs: "100%", sm: "auto" },
              order: { xs: 1, md: 1 },
              justifyContent: "center",
              p: { xs: "0 16px", sm: 0 },
            }}
          >
            <Button
              onClick={handleCloseModal}
              sx={{
                bgcolor: "#22c55e",
                color: "#fff",
                "&:hover": { bgcolor: "#16a34a" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 0.25 },
                borderRadius: "6px",
                minWidth: { sm: "80px" },
                minHeight: { xs: "38px", sm: "36px" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              ቀጥል
            </Button>
            <Button
              onClick={handleKickPlayer}
              sx={{
                bgcolor: "#f97316",
                color: "#fff",
                "&:hover": { bgcolor: "#ea580c" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 0.25 },
                borderRadius: "6px",
                minWidth: { sm: "80px" },
                minHeight: { xs: "38px", sm: "36px" },
                width: { xs: "100%", sm: "auto" },
              }}
              disabled={lockedCards.includes(cardIdInput)}
            >
              ተጫዋቹን አስወግድ
            </Button>
            <Button
              onClick={handleEndGame}
              sx={{
                bgcolor: "#ef4444",
                color: "#fff",
                "&:hover": { bgcolor: "#dc2626" },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 0.25 },
                borderRadius: "6px",
                minWidth: { sm: "80px" },
                minHeight: { xs: "38px", sm: "36px" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              ጨዋታው አልቋል
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WinnerDialog;
