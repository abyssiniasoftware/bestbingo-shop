import { useState, useEffect } from "react";
import { Box, styled } from "@mui/material";

// Animations
const animations = `
@keyframes calledPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes shuffleGlow {
  0% { box-shadow: 0 0 5px #fbbf24; filter: brightness(1.2); }
  50% { box-shadow: 0 0 15px #f59e0b, 0 0 30px #f59e0b; filter: brightness(1.5); }
  100% { box-shadow: 0 0 5px #fbbf24; filter: brightness(1.2); }
}

@keyframes numberFlip {
  0% { transform: perspective(400px) rotateX(0deg); opacity: 1; }
  50% { transform: perspective(400px) rotateX(180deg); opacity: 0.5; }
  100% { transform: perspective(400px) rotateX(360deg); opacity: 1; }
}
`;

// Letter colors matching screenshots exactly
const letterStylesByLetter = {
  B: {
    border: "#8a00ff", // Purple
    bg: "radial-gradient(circle at 30% 30%, #b388ff 0%, #8a00ff 60%, #6200ea 100%)",
  },
  I: {
    border: "#E91E63", // Pink
    bg: "radial-gradient(circle at 30% 30%, #ff6090 0%, #E91E63 60%, #c2185b 100%)",
  },
  N: {
    border: "#0037ff", // Blue
    bg: "radial-gradient(circle at 30% 30%, #448aff 0%, #0037ff 60%, #0026ca 100%)",
  },
  G: {
    border: "#dbcd0a", // Yellow
    bg: "radial-gradient(circle at 30% 30%, #fff59d 0%, #dbcd0a 60%, #c0b300 100%)",
  },
  O: {
    border: "#2fe91e", // Green
    bg: "radial-gradient(circle at 30% 30%, #76ff03 0%, #2fe91e 60%, #00c853 100%)",
  },
};

// BINGO Letter Circle
const StyledBingoLetter = styled(Box)(({ letter }) => {
  const style = letterStylesByLetter[letter] || letterStylesByLetter.B;
  return {
    width: 50,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#fff",
    background: style.bg,
    borderRadius: "50%",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)",
    border: `3px solid ${style.border}`,
    marginRight: 16,
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    flexShrink: 0,
  };
});

// Number Cell
const StyledNumberCell = styled(Box)(({ theme, called: isCalled, isShuffling }) => ({
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem",
  fontWeight: "bold",
  borderRadius: "50%",
  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  cursor: "default",
  userSelect: "none",
  margin: "2px 4px",

  // Background based on state
  background: isShuffling
    ? "linear-gradient(to bottom, #FFD700, #FF8C00)"
    : isCalled
      ? "linear-gradient(to bottom, #ffc000, #e69500)" // Yellow/orange for called
      : "linear-gradient(to bottom, #035fff, #006486)", // Blue for uncalled

  color: isCalled ? "#000" : "#fff",
  opacity: isCalled ? 1 : 0.75,

  boxShadow: isCalled
    ? "0 4px 8px rgba(0, 0, 0, 0.3), inset 0 -3px 6px rgba(0,0,0,0.2)"
    : "0 2px 4px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.1)",

  animation: isShuffling
    ? "shuffleGlow 0.3s ease-in-out"
    : isCalled
      ? "calledPulse 0.4s ease-out"
      : "none",

  "&:hover": {
    transform: "scale(1.05)",
    zIndex: 10,
    boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
  },

  [theme.breakpoints.down("lg")]: { width: 44, height: 44, fontSize: "1.1rem" },
  [theme.breakpoints.down("md")]: { width: 38, height: 38, fontSize: "1rem" },
  [theme.breakpoints.down("sm")]: { width: 32, height: 32, fontSize: "0.85rem" },
}));

// Utility
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const BingoGrid = ({ calledNumbers, shuffling }) => {
  const [shuffledNumber, setShuffledNumber] = useState(null);
  const [fastShuffleNums, setFastShuffleNums] = useState([]);
  const [displayNumbers, setDisplayNumbers] = useState({});
  const [isFastShuffling, setIsFastShuffling] = useState(false);

  // Shuffle simulation
  useEffect(() => {
    if (!shuffling) {
      const timeout = setTimeout(() => {
        setShuffledNumber(null);
        setFastShuffleNums([]);
        setDisplayNumbers({});
        setIsFastShuffling(false);
      }, 0);
      return () => clearTimeout(timeout);
    }

    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const uncalledNumbers = allNumbers.filter(num => !calledNumbers.includes(num.toString()));

    if (uncalledNumbers.length === 0) {
      setTimeout(() => {
        setShuffledNumber(null);
        setFastShuffleNums([]);
        setDisplayNumbers({});
        setIsFastShuffling(false);
      }, 0);
      return;
    }

    setIsFastShuffling(true);

    let shuffleCount = 0;
    const maxShuffleRounds = 50;
    const numbersToShuffle = 60;

    const fastShuffleInterval = setInterval(() => {
      shuffleCount += 1;
      const shuffledIndices = [];
      const shuffledNumbers = [];

      while (shuffledIndices.length < Math.min(numbersToShuffle, uncalledNumbers.length)) {
        const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
        if (!shuffledIndices.includes(randomIndex)) {
          shuffledIndices.push(randomIndex);
          shuffledNumbers.push(uncalledNumbers[randomIndex]);
        }
      }

      setFastShuffleNums(shuffledNumbers);

      const newDisplayNumbers = {};
      shuffledNumbers.forEach(num => {
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

    const selectTimeout = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
      setShuffledNumber(uncalledNumbers[randomIndex]);
    }, 100 * maxShuffleRounds + 1200);

    return () => {
      clearTimeout(selectTimeout);
      clearInterval(fastShuffleInterval);
    };
  }, [shuffling, calledNumbers]);

  const letters = ["B", "I", "N", "G", "O"];

  return (
    <>
      <style>{animations}</style>
      <Box
        className="bingo-grid-container"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          padding: 1,
        }}
      >
        {letters.map((letter, rowIdx) => {
          const startNum = rowIdx * 15 + 1;

          return (
            <Box
              key={letter}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.25,
              }}
            >
              {/* BINGO letter */}
              <StyledBingoLetter letter={letter}>{letter}</StyledBingoLetter>

              {/* Numbers 1-15, 16-30, etc. */}
              {Array.from({ length: 15 }, (_, colIdx) => {
                const num = startNum + colIdx;
                const isCalled = calledNumbers.includes(num.toString());
                const isShuffled = num === shuffledNumber && !isCalled;
                const isFastShuffled = fastShuffleNums.includes(num) && isFastShuffling && !isCalled;
                const displayNum = isFastShuffled ? (displayNumbers[num] || num) : num;

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
