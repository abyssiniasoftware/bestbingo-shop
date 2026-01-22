import { useState, useEffect } from "react";

import { Box, Grid, Typography, styled } from "@mui/material";


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

}

@keyframes shuffleGlow {
  0% { box-shadow: 0 0 5px #fbbf24; filter: brightness(1.2); }
  50% { box-shadow: 0 0 20px #f59e0b, 0 0 40px #f59e0b; filter: brightness(2); }
  100% { box-shadow: 0 0 5px #fbbf24; filter: brightness(1.2); }
}

@keyframes shuffleBackground {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

// BINGO letter styles

const letterColors = {
  B: "radial-gradient(circle at 30% 30%, #40c4ff 0%, #0091ea 100%)",
  I: "radial-gradient(circle at 30% 30%, #ff5252 0%, #d50000 100%)",
  N: "radial-gradient(circle at 30% 30%, #ffeb3b 0%, #fbc02d 100%)",
  G: "radial-gradient(circle at 30% 30%, #69f0ae 0%, #00c853 100%)",
  O: "radial-gradient(circle at 30% 30%, #757575 0%, #212121 100%)",
};


const StyledBingoLetter = styled(Box)(({ letter }) => ({
  width: "60px",
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#fff",
  background: letterColors[letter] || letterColors.B,
  borderRadius: "50%",
  boxShadow: "0 6px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)",
  border: "3px solid white",
  marginRight: "20px",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
}));


const StyledNumberCell = styled(Box)(({ theme, called: isCalled, isShuffling }) => ({
  width: "58px",
  height: "58px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.4rem",
  fontWeight: "900",
  borderRadius: "50%",
  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  cursor: "default",
  userSelect: "none",
  boxShadow: isCalled
    ? "0 6px 12px rgba(0, 0, 0, 0.3), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.5)"
    : "0 3px 6px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)",

  // Background logic - High contrast
  background: isShuffling
    ? "radial-gradient(circle at 30% 30%, #FFD700 0%, #FF8C00 100%)"
    : isCalled
      ? "radial-gradient(circle at 30% 30%, #ffff00 0%, #fbc02d 60%, #e65100 100%)" // Glossy yellow/orange
      : "radial-gradient(circle at 30% 30%, #ffffff 0%, #e0e0e0 60%, #bdbdbd 100%)", // Glossy white/grey

  color: isCalled ? "#000" : "#333",
  border: isCalled ? "1px solid #ff6f00" : "1px solid #cfd8dc",

  animation: isCalled ? "calledPulse 0.4s ease-out" : "none",

  "&:hover": {
    transform: "scale(1.1) translateY(-2px)",
    zIndex: 10,
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
  },

  [theme.breakpoints.down("lg")]: { width: "48px", height: "48px", fontSize: "1.2rem" },
  [theme.breakpoints.down("md")]: { width: "40px", height: "40px", fontSize: "1rem" },
  [theme.breakpoints.down("sm")]: { width: "32px", height: "32px", fontSize: "0.8rem" },
}));


// Utility functions
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const BingoGrid = ({ calledNumbers, shuffling }) => {
  const [shuffledNumber, setShuffledNumber] = useState(null);

  const [fastShuffleNums, setFastShuffleNums] = useState([]);

  const [displayNumbers, setDisplayNumbers] = useState({});

  const [isFastShuffling, setIsFastShuffling] = useState(false);

  // Shuffle simulation

  useEffect(() => {
    if (!shuffling) {
      setTimeout(() => {
        if (shuffledNumber !== null) setShuffledNumber(null);
        if (fastShuffleNums.length > 0) setFastShuffleNums([]);
        if (Object.keys(displayNumbers).length > 0) setDisplayNumbers({});
        if (isFastShuffling) setIsFastShuffling(false);
      }, 0);
      return;
    }

    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);

    const uncalledNumbers = allNumbers.filter(
      (num) => !calledNumbers.includes(num.toString()),
    );

    if (uncalledNumbers.length === 0) {
      setTimeout(() => {
        setShuffledNumber(null);
        setFastShuffleNums([]);
        setDisplayNumbers({});
        setIsFastShuffling(false);
      }, 0);
      return;
    }

    setTimeout(() => {
      setIsFastShuffling(true);
    }, 0);

    let shuffleCount = 0;

    const maxShuffleRounds = 50;

    const numbersToShuffle = 60;

    const fastShuffleInterval = setInterval(() => {
      shuffleCount += 1;

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

      const newDisplayNumbers = {};

      shuffledNumbers.forEach((num) => {
        newDisplayNumbers[num] = getRandomInt(1, 75);
      });

      setDisplayNumbers(newDisplayNumbers);

      if (shuffleCount >= maxShuffleRounds) {
        clearInterval(fastShuffleInterval);

        setIsFastShuffling(false);

        setFastShuffleNums([]);

        setDisplayNumbers({});
      }
    }, 100);

    const selectTimeout = setTimeout(
      () => {
        const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);

        const selectedNumber = uncalledNumbers[randomIndex];

        setShuffledNumber(selectedNumber);
      },
      100 * maxShuffleRounds + 1200,
    );

    return () => {
      clearTimeout(selectTimeout);

      clearInterval(fastShuffleInterval);
    };
  }, [shuffling, calledNumbers, shuffledNumber, fastShuffleNums.length, displayNumbers, isFastShuffling]);

  const letters = ["B", "I", "N", "G", "O"];

  // Render the grid in 5 rows (one per BINGO letter)

  return (
    <>
      <style>
        {gridPulseAnimation} {calledPulseAnimation} {numberFlipAnimation}
      </style>

      <Box
        className="bingo-grid-container"
        sx={{
          background: "rgba(255,255,255,0.1)",
          padding: { xs: "10px", sm: "20px" },
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {letters.map((letter, rowIdx) => {
          const startNum = rowIdx * 15 + 1;

          return (
            <Box
              key={letter}
              sx={{
                display: "flex",

                gap: { xs: 0.25, sm: 0.5 },

                mb: { xs: 0.25, sm: 0.5 },
              }}
            >
              {/* BINGO letter */}

              <StyledBingoLetter letter={letter}>{letter}</StyledBingoLetter>

              {/* Numbers 1-15, 16-30, etc. */}

              {Array.from({ length: 15 }, (_, colIdx) => {
                const num = startNum + colIdx;

                const isCalled = calledNumbers.includes(num.toString());

                const isShuffled = num === shuffledNumber && !isCalled;

                const isFastShuffled =
                  fastShuffleNums.includes(num) && isFastShuffling && !isCalled;

                const displayNum = isFastShuffled
                  ? displayNumbers[num] || num
                  : num;

                return (
                  <StyledNumberCell
                    id={`cell-number-${num}`}
                    key={num}
                    called={isCalled}
                    isShuffling={isShuffled || isFastShuffled}
                  >
                    {displayNum}
                  </StyledNumberCell>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default BingoGrid;
