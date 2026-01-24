import { useState, useEffect } from "react";

const BingoGrid = ({ calledNumbers, shuffling }) => {
  const [highlightedNumbers, setHighlightedNumbers] = useState([]);

  // Handle shuffling animation
  useEffect(() => {
    if (!shuffling) return;

    const intervalId = setInterval(() => {
      const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
      const uncalledNumbers = allNumbers.filter(
        (num) => !calledNumbers.includes(num.toString())
      );

      if (uncalledNumbers.length > 0) {
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
    }, 115);

    return () => clearInterval(intervalId);
  }, [shuffling, calledNumbers]);

  // Clear highlights when shuffling stops
  if (!shuffling && highlightedNumbers.length > 0) {
    setHighlightedNumbers([]);
  }

  const letters = ["B", "I", "N", "G", "O"];
const lastCalledNumber =
  calledNumbers.length > 0
    ? parseInt(calledNumbers[calledNumbers.length - 1], 10)
    : null;

  // Letter border colors matching styles.css
  const letterBorderColors = {
    B: 'hsl(259, 100%, 50%)', // purple
    I: '#E91E63', // pink
    N: 'hsl(237, 100%, 50%)', // blue
    G: '#dbcd0a', // yellow
    O: '#2fe91e', // green
  };

  return (
    <div>
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
              const isLastCalled = num === lastCalledNumber;

              // CSS classes: selected = yellow highlight (called or shuffle-highlighted)
              let className = "number";
              if (isCalled || isHighlighted) {
                className += " selected";
              }

              // ⭐ BLINK only the LAST called number
              if (isLastCalled) {
                className += " blink";
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
