import React from 'react';
import BingoGrid from "./BingoGrid";
import CurrentBallPanel from "./CurrentBallPanel";

const MainPanel = ({
  calledNumbers,
  isShuffling,
  showCurrentBall,
  currentNumber,
  recentCalls,
  onViewAll
}) => {
  return (
    <div className="bingo-panel">
      <BingoGrid
        calledNumbers={calledNumbers}
        shuffling={isShuffling}
      />

      {showCurrentBall && (
        <CurrentBallPanel
          currentNumber={currentNumber}
          recentCalls={recentCalls}
          onViewAll={onViewAll}
        />
      )}
    </div>
  );
};

export default MainPanel;