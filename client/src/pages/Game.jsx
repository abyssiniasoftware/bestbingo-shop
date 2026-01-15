import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, IconButton, Button, Dialog, DialogContent, Typography } from "@mui/material";
import GameStartModal from "../components/game/GameStartModal";
import GameTopSection from "../components/game/GameTopSection";
import GameControlsBar from "../components/game/GameControlsBar";
import BingoGrid from "../components/game/BingoGrid";
import WinnerDialog from "../components/game/WinnerDialog";
import CentralBallOverlay from "../components/game/CentralBallOverlay";
import { pulseAnimation } from "../components/game/GameStyles";
import useGameLogic from "../hooks/useGameLogic";
import useGameStore from "../stores/gameStore";
import {
  backgroundOptions,
  voiceOptions,
  BINGO_PATTERNS,
} from "../constants/constants";
import "../styles/game-redesign.css";

const Game = () => {
  const { stake, players, winAmount } = useParams();
  const navigate = useNavigate();
  const { gameData } = useGameStore();
  const [showStartModal, setShowStartModal] = useState(true);
  const {
    calledNumbers,
    recentCalls,
    currentNumber,
    callCount,
    isPlaying,
    isShuffling,
    cardIdInput,
    setCardIdInput,
    openModal,
    cardNumbers,
    cartelaData,
    bingoState,
    patternTypes,
    lockedCards,
    drawSpeed,
    setDrawSpeed,
    voiceOption,
    patternAnimationIndex,
    isGameEnded,
    selectedBackground,
    hasGameStarted,
    checkWinner,
    handleVoiceChange,
    possiblePatterns,
    handleEndGame,
    handleShuffleClick,
    handleCloseModal,
    clearLockedCards,
    togglePlayPause,
    bonusAwarded,
    bonusAmountGiven,
    dynamicBonusAmount,
    enableDynamicBonus,
    isManual,
    setIsManual,
    isAutomatic,
    setIsAutomatic,
    declareWinnerManually,
    handleReset,
    primaryPattern,
    setLockedCards,
    bonusAmount,
    bonusPattern,
    showCentralBall,
    isCentralBallMoving,
    moveDuration,
    blowerZoomBall,
    playWinnerAudio,
    playLoseAudio,
  } = useGameLogic({ stake, players, winAmount });

  const [openNewGameConfirm, setOpenNewGameConfirm] = useState(false);

  const backgroundStyle = backgroundOptions.find(
    (bg) => bg.value === selectedBackground,
  )?.style || { backgroundColor: "#111827" };

  const handleBack = () => {
    navigate("/dashboard", { state: { gameId: gameData?.game.gameId } });
  };

  const handleStartGame = () => {
    setShowStartModal(false);

    togglePlayPause();
  };

  // Check if there's a reservation (cards selected)

  const hasReservation = gameData?.cartela?.length > 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        ...backgroundStyle,
      }}
    >
      <style>{pulseAnimation}</style>

      {/* Game Start Modal - shows over the game background */}

      <GameStartModal
        isOpen={showStartModal && !hasGameStarted}
        onClose={() => setShowStartModal(false)}
        hasReservation={hasReservation}
        roundNumber={gameData?.game?.gameId || 1}
      />

      {/* Main game content */}

      <Box sx={{ flex: 1, p: { xs: 1, sm: 2 } }}>
        {/* Top Section: Comprehensive Header */}

        <GameTopSection
          calledNumbers={calledNumbers}
          currentNumber={currentNumber}
          recentCalls={recentCalls}
          callCount={callCount}
          gameDetails={gameData?.game}
          patterns={possiblePatterns}
          patternAnimationIndex={patternAnimationIndex}
          enableDynamicBonus={enableDynamicBonus}
          dynamicBonusAmount={dynamicBonusAmount}
          bonusAmount={bonusAmount}
          bonusPattern={bonusPattern}
          winAmount={winAmount}
          blowerZoomBall={blowerZoomBall}
        />

        {/* BINGO Grid */}

        <Box sx={{ mb: 2 }}>
          <BingoGrid calledNumbers={calledNumbers} shuffling={isShuffling} />
        </Box>

        {/* Central Ball Animation Overlay */}
        <CentralBallOverlay
          currentNumber={currentNumber}
          show={showCentralBall}
          isMoving={isCentralBallMoving}
          moveDuration={moveDuration}
        />

        {/* Bottom Controls Bar */}
        <GameControlsBar
          isPlaying={isPlaying}
          isShuffling={isShuffling}
          togglePlayPause={togglePlayPause}
          handleShuffleClick={handleShuffleClick}
          voiceOptions={voiceOptions}
          voiceOption={voiceOption}
          handleVoiceChange={handleVoiceChange}
          drawSpeed={drawSpeed}
          setDrawSpeed={setDrawSpeed}
          cardIdInput={cardIdInput}
          setCardIdInput={setCardIdInput}
          checkWinner={checkWinner}
          handleBack={handleBack}
          isGameEnded={isGameEnded}
          hasGameStarted={hasGameStarted}
          handleEndGame={handleEndGame}
          isManual={isManual}
          setIsManual={setIsManual}
          isAutomatic={isAutomatic}
          setIsAutomatic={setIsAutomatic}
          onNewGameClick={() => setOpenNewGameConfirm(true)}
        />
      </Box>

      {/* New Game Confirmation Modal */}
      <Dialog
        open={openNewGameConfirm}
        onClose={() => setOpenNewGameConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "16px",
            bgcolor: "#fff",
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", pb: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, color: "#374151" }}>
            Start a New Game?
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, color: "#374151" }}>
            አዲስ ጨዋታ ይጀምሩ?
          </Typography>
          <Typography variant="body1" sx={{ color: "#6b7280", mb: 3 }}>
            የነበረው ይጠፋል?
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
            <Button
              onClick={() => {
                handleReset();
                setOpenNewGameConfirm(false);
              }}
              sx={{
                bgcolor: "#10b981",
                color: "#fff",
                px: 4,
                py: 1,
                fontSize: "1rem",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#059669" },
                borderRadius: "8px",
                textTransform: "none",
              }}
            >
              OK
            </Button>
            <Button
              onClick={() => setOpenNewGameConfirm(false)}
              sx={{
                bgcolor: "#ef4444",
                color: "#fff",
                px: 4,
                py: 1,
                fontSize: "1rem",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#dc2626" },
                borderRadius: "8px",
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Winner Dialog */}

      <WinnerDialog
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        cardIdInput={cardIdInput}
        cardNumbers={cardNumbers}
        calledNumbers={calledNumbers}
        cartelaData={cartelaData}
        bingoState={bingoState}
        patternTypes={patternTypes}
        selectedPattern={primaryPattern}
        lockedCards={lockedCards}
        setLockedCards={setLockedCards}
        clearLockedCards={clearLockedCards}
        BINGO_PATTERNS={BINGO_PATTERNS}
        isGameEnded={isGameEnded}
        bonusAwarded={bonusAwarded}
        bonusAmount={bonusAmountGiven.toFixed(0)}
        handleEndGame={handleEndGame}
        isManual={isManual}
        isAutomatic={isAutomatic}
        declareWinnerManually={declareWinnerManually}
        handleReset={handleReset}
        onNewGameClick={() => setOpenNewGameConfirm(true)}
        playWinnerAudio={playWinnerAudio}
        playLoseAudio={playLoseAudio}
      />
    </Box>
  );
};

export default Game;
