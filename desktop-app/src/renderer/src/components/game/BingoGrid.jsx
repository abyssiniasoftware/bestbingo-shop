import { useState, useEffect } from "react";

import { Box, Grid, Typography, styled } from "@mui/material";
import { called, num } from "../../images/images";


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
  B: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",

  I: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",

  N: "linear-gradient(135deg, #854d0e 0%, #eab308 100%)",

  G: "linear-gradient(135deg, #14532d 0%, #22c55e 100%)",

  O: "linear-gradient(135deg, #374151 0%, #6b7280 100%)",
};

const StyledBingoLetter = styled(Box, {
  shouldForwardProp: (prop) => prop !== "letter",
})(({ letter }) => ({
  width: "100%", // Fill the column width
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#fff",
  // Simple gradients for headers
  background: letterColors[letter] || letterColors.B,
  borderRadius: "4px",
  marginBottom: "4px", // Small gap between header and numbers
}));

const StyledNumberCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== "called" && prop !== "isShuffling",
})(({ theme, called, isShuffling }) => ({
  // Dimensions: Set width to fill the grid column, fixed height for the "bar" look
  width: "100%",
  height: "65px", // Increased height to match the tall rectangular look in screenshot

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  // Typography
  fontSize: "2rem", // Larger font to match screenshot
  fontWeight: "900", // Extra bold
  color: "#fff",
  textShadow: "0px 2px 4px rgba(0,0,0,0.6)", // Text shadow for better readability

  backgroundImage: isShuffling
    ? "linear-gradient(45deg, #FFD700, #FF8C00, #FF4500, #FFD700)"
    : called
      ?  `url(${called})`
      : `url(${num})`,

  backgroundSize: isShuffling ? "300% 300%" : "100% 100%", // Larger size for gradient movement
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  backgroundColor: "transparent", // Ensure no solid color sits behind

  cursor: "default",
  userSelect: "none",

  // Animations
  transition: "all 0.2s ease",
  zIndex: isShuffling ? 10 : 1,
  animation: isShuffling
    ? "shuffleBackground 0.8s ease infinite, numberFlip 0.3s ease-in-out infinite"
    : called
      ? "calledPulse 0.4s ease-in-out"
      : "none",

  // Responsive Breakpoints
  [theme.breakpoints.down("lg")]: {
    height: "55px",
    fontSize: "1.75rem",
  },
  [theme.breakpoints.down("md")]: {
    height: "45px",
    fontSize: "1.4rem",
  },
  [theme.breakpoints.down("sm")]: {
    height: "35px",
    fontSize: "1rem",
  },
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
          background: "#1a1a1a",

          padding: { xs: "5px", sm: "10px" },

          borderRadius: "8px",

          overflowX: "auto",
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
