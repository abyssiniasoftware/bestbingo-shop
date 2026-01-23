import { useState, useEffect } from "react";

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

  // Letter border colors matching styles.css
  const letterBorderColors = {
    B: 'hsl(259, 100%, 50%)', // purple
    I: '#E91E63', // pink
    N: 'hsl(237, 100%, 50%)', // blue
    G: '#dbcd0a', // yellow
    O: '#2fe91e', // green
  };

  return (
    <div className="bingo-grid">
      {letters.map((letter, rowIdx) => {
        const startNum = rowIdx * 15 + 1;

        return (
          <div key={letter} className="bingo-row">
            {/* BINGO letter */}
            <div
              className="letter"
              data-letter={letter}
              style={{ borderColor: letterBorderColors[letter] }}
            >
              {letter}
            </div>

            {/* Numbers 1-15, 16-30, etc. */}
            {Array.from({ length: 15 }, (_, colIdx) => {
              const num = startNum + colIdx;
              const isCalled = calledNumbers.includes(num.toString());
              const isShuffled = num === shuffledNumber && !isCalled;
              const isFastShuffled = fastShuffleNums.includes(num) && isFastShuffling && !isCalled;
              const displayNum = isFastShuffled ? (displayNumbers[num] || num) : num;

              // CSS classes based on state: number, selected, blink
              let className = "number";
              if (isCalled) {
                className += " selected";
              } else if (isShuffled) {
                className += " blink";
              }
              // When shuffling and not called, numbers rotate (handled by CSS)

              return (
                <div
                  key={num}
                  id={`cell-number-${num}`}
                  className={className}
                  style={
                    // Stop rotation animation for called numbers
                    isCalled ? { animation: 'bounceBall 0.5s' } : {}
                  }
                >
                  {displayNum}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default BingoGrid;
