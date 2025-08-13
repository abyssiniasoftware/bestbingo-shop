import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// Define animations
const gridPulseAnimation = `
  @keyframes gridPulse {
    0% { transform: scale(1); background-color: #1f2937; }
    50% { transform: scale(1.1); background-color: #3b82f6; }
    100% { transform: scale(1); background-color: #1f2937; }
`;

const calledPulseAnimation = `
  @keyframes calledPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
`;

const numberFlipAnimation = `
  @keyframes numberFlip {
    0% { transform: perspective(400px) rotateX(0deg); opacity: 1; }
    50% { transform: perspective(400px) rotateX(90deg); opacity: 0.3; }
    100% { transform: perspective(400px) rotateX(0deg); opacity: 1; }
`;

const StyledNumberButton = styled(Box)(({ theme, called, isShuffling }) => ({
  width: "clamp(28px, 6vw, 50px)",
  height: "clamp(28px, 6vw, 50px)",
  fontSize: "clamp(1.2rem, 3vw, 4rem)",
  borderRadius: "0px",
  fontWeight: "bold",
  color: "#fff",
  backgroundColor: called ? "#22c55e" : isShuffling ? "#f59e0b" : "#1f2937",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "background-color 0.3s ease, transform 0.2s ease",
  animation: isShuffling
    ? "gridPulse 0.6s ease-in-out, numberFlip 0.3s ease-in-out"
    : called
    ? "calledPulse 0.4s ease-in-out"
    : "none",
  [theme.breakpoints.up("lg")]: {
    width: "clamp(40px, 5.7vw, 78px)",
    height: "clamp(28px, 5vw, 60px)",
  },
}));

const StyledBingoLetter = styled(Typography)(({ theme }) => ({
  width: "clamp(28px, 6vw, 50px)",
  height: "clamp(28px, 6vw, 50px)",
  fontSize: "clamp(1.5rem, 2.5vw, 2.7rem)",
  borderRadius: "0px",
  fontWeight: "bold",
  color: "#fff",
  backgroundColor: "#60a5fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  [theme.breakpoints.up("lg")]: {
    width: "clamp(40px, 5.7vw, 78px)",
    height: "clamp(28px, 5vw, 60px)",
  },
}));

// Utility functions
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getBingoLetter = (number) => {
  if (number >= 1 && number <= 15) return "B";
  if (number >= 16 && number <= 30) return "I";
  if (number >= 31 && number <= 45) return "N";
  if (number >= 46 && number <= 60) return "G";
  return "O";
};

const BingoGrid = ({ calledNumbers, shuffling }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [shuffledNumber, setShuffledNumber] = useState(null);
  const [fastShuffleNums, setFastShuffleNums] = useState([]);
  const [displayNumbers, setDisplayNumbers] = useState({}); // Track display numbers for each cell
  const [isFastShuffling, setIsFastShuffling] = useState(false);

  // Shuffle simulation
  useEffect(() => {
    if (!shuffling) {
      setShuffledNumber(null);
      setFastShuffleNums([]);
      setDisplayNumbers({});
      setIsFastShuffling(false);
      return;
    }

    // Generate uncalled numbers
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const uncalledNumbers = allNumbers.filter(
      (num) => !calledNumbers.includes(num.toString())
    );
    if (uncalledNumbers.length === 0) {
      setShuffledNumber(null);
      setFastShuffleNums([]);
      setDisplayNumbers({});
      setIsFastShuffling(false);
      return;
    }

    // Fast shuffle effect with multiple numbers
    setIsFastShuffling(true);
    let shuffleCount = 0;
    const maxShuffleRounds = 50;
    const numbersToShuffle = 60; // Number of simultaneous shuffling numbers
    const fastShuffleInterval = setInterval(() => {
      shuffleCount += 1;
      // Select multiple random numbers
      const shuffledIndices = [];
      const shuffledNumbers = [];
      while (
        shuffledIndices.length <
        Math.min(numbersToShuffle, uncalledNumbers.length)
      ) {
        const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
        if (!shuffledIndices.includes(randomIndex)) {
          shuffledIndices.push(randomIndex);
          shuffledNumbers.push(uncalledNumbers[randomIndex]);
        }
      }
      setFastShuffleNums(shuffledNumbers);

      // Update display numbers for each shuffling cell
      const newDisplayNumbers = {};
      shuffledNumbers.forEach((num) => {
        newDisplayNumbers[num] = getRandomInt(1, 75); // Random number for display
      });
      setDisplayNumbers(newDisplayNumbers);

      if (shuffleCount >= maxShuffleRounds) {
        clearInterval(fastShuffleInterval);
        setIsFastShuffling(false);
        setFastShuffleNums([]);
        setDisplayNumbers({});
      }
    }, 100); // Slower interval to make number changes visible

    // Select a single number after fast shuffle
    const selectTimeout = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
      const selectedNumber = uncalledNumbers[randomIndex];
      setShuffledNumber(selectedNumber);
    }, 100 * maxShuffleRounds + 1200);

    return () => {
      clearTimeout(selectTimeout);
      clearInterval(fastShuffleInterval);
    };
  }, [shuffling, calledNumbers]);

  const letters = ["B", "I", "N", "G", "O"];

  return (
    <>
      <style>
        {gridPulseAnimation} {calledPulseAnimation} {numberFlipAnimation}
      </style>
      {isSmallScreen ? (
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
            {letters.map((letter, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <StyledBingoLetter>{letter}</StyledBingoLetter>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    mt: 0.5,
                  }}
                >
                  {Array.from({ length: 15 }).map((_, i) => {
                    const num = idx * 15 + i + 1;
                    const isCalled = calledNumbers.includes(num.toString());
                    const isShuffled = num === shuffledNumber && !isCalled;
                    const isFastShuffled =
                      fastShuffleNums.includes(num) &&
                      isFastShuffling &&
                      !isCalled;
                    const displayNum = isFastShuffled
                      ? displayNumbers[num] || num
                      : num;
                    return (
                      <StyledNumberButton
                        key={num}
                        called={isCalled}
                        isShuffling={isShuffled || isFastShuffled}
                      >
                        {displayNum}
                      </StyledNumberButton>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100vw",
            overflowX: "auto",
            boxSizing: "border-box",
            p: 1,
            display: "flex",
            "&::-webkit-scrollbar": { height: "8px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#60a5fa",
              borderRadius: "4px",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              minWidth: {
                xs: "auto",
                md: `calc(${15 * parseFloat(theme.spacing(0.5))}px + ${
                  15 * 55
                }px + 55px)`,
                lg: `calc(${15 * parseFloat(theme.spacing(0.5))}px + ${
                  15 * 60
                }px + 60px)`,
              },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {letters.map((letter, idx) => (
                <StyledBingoLetter key={idx}>{letter}</StyledBingoLetter>
              ))}
            </Box>
            <Box>
              <Grid container spacing={0.5}>
                {Array.from({ length: 5 }).map((_, rowIdx) => {
                  const start = rowIdx * 15 + 1;
                  return (
                    <Grid
                      container
                      item
                      key={rowIdx}
                      spacing={0.5}
                      sx={{ flexWrap: "nowrap" }}
                    >
                      {Array.from({ length: 15 }, (_, colIdx) => {
                        const num = start + colIdx;
                        const isCalled = calledNumbers.includes(num.toString());
                        const isShuffled = num === shuffledNumber && !isCalled;
                        const isFastShuffled =
                          fastShuffleNums.includes(num) &&
                          isFastShuffling &&
                          !isCalled;
                        const displayNum = isFastShuffled
                          ? displayNumbers[num] || num
                          : num;
                        return (
                          <Grid item key={num}>
                            <StyledNumberButton
                              called={isCalled}
                              isShuffling={isShuffled || isFastShuffled}
                            >
                              {displayNum}
                            </StyledNumberButton>
                          </Grid>
                        );
                      })}
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default BingoGrid;
