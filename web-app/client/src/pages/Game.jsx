import { useGameParams } from "../hooks/useGameParams";
import { useGameNavigation } from "../hooks/useGameNavigation";
import { getGameState } from "../utils/gameStateUtils";
import useGameLogic from "../hooks/useGameLogic";

import {
  GameHeader,
  GameFooter,
  WinnerDialog,
  MainPanel,
  ActionPanel,
  CalledNumbersModal,
} from "../components/game/";

import useGameStore from "../stores/gameStore";
import { BINGO_PATTERNS } from "../constants/constants";
import { useState } from "react";

const Game = ({
  stake: propStake,
  players: propPlayers,
  winAmount: propWinAmount,
  voiceOption: passedVoiceOption
}) => {
  // Get game parameters
  const gameParams = useGameParams({
    stake: propStake,
    players: propPlayers,
    winAmount: propWinAmount,
    voiceOption: passedVoiceOption,
  });
  const { stake, players, winAmount, voiceOption } = gameParams;

  // Get game data from store
  const { gameData } = useGameStore();

  // Get game logic
  const gameLogic = useGameLogic(stake, players, winAmount, voiceOption);

  // Setup navigation
  const navigation = useGameNavigation(gameLogic.handleReset);

  // Derive game state
  const gameState = getGameState(gameData, gameLogic.callCount);

  // Called numbers history modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Navigation handlers with game data
  const handleBack = () => navigation.handleBack(gameData?.game.gameId);
  const handleNewGameClick = navigation.handleNewGameClick;

  return (
    <div className="bingo-container">
      <GameHeader
        isPlaying={gameLogic.isPlaying}
        stake={stake}
        winAmount={winAmount}
        callCount={gameLogic.callCount}
      />

      <MainPanel
        calledNumbers={gameLogic.calledNumbers}
        isShuffling={gameLogic.isShuffling}
        showCurrentBall={gameState.showCurrentBall}
        currentNumber={gameLogic.currentNumber}
        recentCalls={gameLogic.recentCalls}
        onViewAll={() => setIsHistoryModalOpen(true)}
      />

      <ActionPanel
        gameLogic={gameLogic}
        navigation={{ handleBack, handleNewGameClick }}
        gameState={gameState}
        winAmount={winAmount}
      />

      <GameFooter />

      <WinnerDialog
        openModal={gameLogic.openModal}
        handleCloseModal={gameLogic.handleCloseModal}
        cardIdInput={gameLogic.cardIdInput}
        cardNumbers={gameLogic.cardNumbers}
        calledNumbers={gameLogic.calledNumbers}
        cartelaData={gameLogic.cartelaData}
        bingoState={gameLogic.bingoState}
        patternTypes={gameLogic.patternTypes}
        selectedPattern={gameLogic.primaryPattern}
        lockedCards={gameLogic.lockedCards}
        setLockedCards={gameLogic.setLockedCards}
        clearLockedCards={gameLogic.clearLockedCards}
        BINGO_PATTERNS={BINGO_PATTERNS}
        isGameEnded={gameLogic.isGameEnded}
        bonusAwarded={gameLogic.bonusAwarded}
        handleEndGame={gameLogic.handleEndGame}
        handleReset={gameLogic.handleReset}
      />

      <CalledNumbersModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        calledNumbers={gameLogic.calledNumbers}
      />
    </div>
  );
};

export default Game;