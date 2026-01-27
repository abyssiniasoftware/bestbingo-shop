import React from 'react';
import GameControlsBar from "./GameControlsBar";
import WinnerMoney from "./WinnerMoney";

const ActionPanel = ({ 
  gameLogic, 
  navigation, 
  gameState, 
  winAmount 
}) => {
  const {
    isPlaying,
    isShuffling,
    drawSpeed,
    cardIdInput,
    callCount,
    isGameEnded,
    hasGameStarted,
    checkWinner,
    handleEndGame,
    handleShuffleClick,
    togglePlayPause,
    setDrawSpeed,
    setCardIdInput,
    callNextNumber,
  } = gameLogic;

  const {
    handleBack,
    handleNewGameClick,
  } = navigation;

  return (
    <div className="action-panel">
      <GameControlsBar
        isPlaying={isPlaying}
        isShuffling={isShuffling}
        togglePlayPause={togglePlayPause}
        handleShuffleClick={handleShuffleClick}
        drawSpeed={drawSpeed}
        setDrawSpeed={setDrawSpeed}
        cardIdInput={cardIdInput}
        setCardIdInput={setCardIdInput}
        checkWinner={checkWinner}
        handleBack={handleBack}
        isGameEnded={isGameEnded}
        hasGameStarted={hasGameStarted}
        handleEndGame={handleEndGame}
        hasReservation={gameState.hasReservation}
        onNewGameClick={handleNewGameClick}
        onCallNext={callNextNumber}
        callCount={callCount}
      />
      <WinnerMoney winAmount={winAmount} />
    </div>
  );
};

export default ActionPanel;