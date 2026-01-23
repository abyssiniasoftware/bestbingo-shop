import { useState, useEffect, useRef } from "react";

// Original shuffle logic from script_v2.js - runs until manually stopped
const BingoGrid = ({ calledNumbers, shuffling }) => {
  const [highlightedNumbers, setHighlightedNumbers] = useState([]);
  const shuffleIntervalRef = useRef(null);

  // Shuffle animation - mirrors original script_v2.js behavior
  // Runs indefinitely every 115ms until explicitly stopped
  useEffect(() => {
    if (shuffling) {
      // Clear any existing interval first
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
      }

      // Start shuffle: randomly highlight 5 numbers every 115ms
      shuffleIntervalRef.current = setInterval(() => {
        const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
        const uncalledNumbers = allNumbers.filter(
          num => !calledNumbers.includes(num.toString())
        );

        if (uncalledNumbers.length > 0) {
          // Randomly select up to 5 numbers to highlight
          const randomCount = Math.min(5, uncalledNumbers.length);
          const highlighted = [];
          const usedIndices = new Set();

          while (highlighted.length < randomCount) {
            const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
            if (!usedIndices.has(randomIndex)) {
              usedIndices.add(randomIndex);
              highlighted.push(uncalledNumbers[randomIndex]);
            }
          }
          setHighlightedNumbers(highlighted);
        }
      }, 115); // Match original: 115ms interval
    } else {
      // Stop shuffle - clear interval and highlights
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
      }
      setHighlightedNumbers([]);
    }

    // Cleanup on unmount
    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
      }
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
              const isHighlighted = highlightedNumbers.includes(num) && !isCalled;

              // CSS classes: selected = yellow highlight (called or shuffle-highlighted)
              let className = "number";
              if (isCalled) {
                className += " selected";
              } else if (isHighlighted) {
                className += " selected"; // Same yellow highlight as original
              }

              return (
                <div
                  key={num}
                  id={`cell-number-${num}`}
                  data-number={num}
                  className={className}
                >
                  {num}
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
