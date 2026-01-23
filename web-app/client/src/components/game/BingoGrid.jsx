import { useState, useEffect } from "react";
import { Box, styled } from "@mui/material";

// Animations from styles.css
const cssAnimations = `
@keyframes rotateNumber {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounceBall {
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
}

@keyframes blink-animation {
  50% { background-color: #ffaf00; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}

@keyframes size-transform {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
`;

// Letter Circle - matching styles.css .letter with data-letter colors
const LetterCircle = styled(Box)(({ letter }) => {
  const borderColors = {
    B: 'hsl(259, 100%, 50%)', // purple
    I: '#E91E63', // pink
    N: 'hsl(237, 100%, 50%)', // blue
    G: '#dbcd0a', // yellow
    O: '#2fe91e', // green
  };

  return {
    backgroundColor: '#ffffff',
    border: `16px solid ${borderColors[letter] || '#FFF521'}`,
    textAlign: 'center',
    color: '#000000',
    borderRadius: '50%',
    fontSize: '20px',
    width: 64,
    height: 64,
    margin: '0 20px 0 4px',
    lineHeight: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0,
  };
});

// Number Cell - matching styles.css .number
const NumberCell = styled(Box)(({ called, shuffling }) => ({
  background: called
    ? '#ffc000'
    : 'linear-gradient(to bottom, #035fff, #006486)',
  color: called ? '#000000' : '#ebf1f7',
  borderRadius: '50%',
  fontSize: called ? '35px' : '25px',
  width: 64,
  height: 64,
  textAlign: 'center',
  transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
  boxShadow: called
    ? '0 4px 8px rgba(0, 0, 0, 0.4)'
    : '0 2px 6px rgba(0, 0, 0, 0.2)',
  lineHeight: '64px',
  fontWeight: 'bold',
  margin: '2px 6px',
  opacity: called ? 1 : 0.75,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Animation based on state
  animation: shuffling
    ? 'rotateNumber 2s infinite linear'
    : called
      ? 'bounceBall 0.5s'
      : 'none',
  borderColor: called ? '#ffaf00' : 'transparent',
}));

// Utility
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const BingoGrid = ({ calledNumbers, shuffling }) => {
  const [shuffledNumber, setShuffledNumber] = useState(null);
  const [fastShuffleNums, setFastShuffleNums] = useState([]);
  const [displayNumbers, setDisplayNumbers] = useState({});
  const [isFastShuffling, setIsFastShuffling] = useState(false);

  // Shuffle simulation - matching the original animation behavior
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
      <style>{cssAnimations}</style>
      <Box className="bingo-grid">
        {letters.map((letter, rowIdx) => {
          const startNum = rowIdx * 15 + 1;

          return (
            <Box
              key={letter}
              className="bingo-row"
              sx={{
                display: "flex",
                marginLeft: 0,
                marginBottom: "10px",
              }}
            >
              {/* BINGO letter */}
              <LetterCircle letter={letter}>{letter}</LetterCircle>

              {/* Numbers 1-15, 16-30, etc. */}
              {Array.from({ length: 15 }, (_, colIdx) => {
                const num = startNum + colIdx;
                const isCalled = calledNumbers.includes(num.toString());
                const isShuffled = num === shuffledNumber && !isCalled;
                const isFastShuffled = fastShuffleNums.includes(num) && isFastShuffling && !isCalled;
                const displayNum = isFastShuffled ? (displayNumbers[num] || num) : num;

                // Apply rotation animation to uncalled numbers during shuffle
                const shouldRotate = (isShuffled || isFastShuffled || (shuffling && !isCalled));

                return (
                  <NumberCell
                    key={num}
                    id={`cell-number-${num}`}
                    called={isCalled}
                    shuffling={shouldRotate}
                  >
                    {displayNum}
                  </NumberCell>
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
