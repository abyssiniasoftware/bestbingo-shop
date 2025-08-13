import { useParams, useNavigate } from "react-router-dom";
import { Box, IconButton, Button } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import TopBar from "../components/game/TopBar";
import LeftSection from "../components/game/LeftSection";
import RightSection from "../components/game/RightSection";
import WinnerDialog from "../components/game/WinnerDialog";
import { pulseAnimation } from "../components/game/GameStyles";
import useGameLogic from "../hooks/useGameLogic";
import useGameStore from "../stores/gameStore";
import {
  backgroundOptions,
  voiceOptions,
  BINGO_PATTERNS,
} from "../constants/constants";
import { getBallColor } from "../utils/gameUtils";

const Game = () => {
  const { stake, players, winAmount } = useParams();
  const navigate = useNavigate();
  const { gameData } = useGameStore();
  const {
    calledNumbers,
    recentCalls,
    currentNumber,
    previousNumber,
    callCount,
    isPlaying,
    isReady,
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
    patternAnchorEl,
    voiceOption,
    prefixedNumber,
    patternAnimationIndex,
    isGameEnded,
    selectedBackground,
    primaryPattern,
    setLockedCards,
    setPrimaryPattern,
    secondaryPattern,
    setSecondaryPattern,
    patternLogic,
    setPatternLogic,
    hasGameStarted,
    checkWinner,
    handleVoiceChange,
    handleBackgroundChange,
    possiblePatterns,
    handleEndGame,
    handleReady,
    handleReset,
    handleShuffleClick,
    handleClose,
    handleCloseModal,
    handlePatternSelectOpen,
    handlePatternSelectClose,
    clearLockedCards,
    togglePlayPause,
    bonusAwarded,
    bonusAmountGiven,
    dynamicBonusAmount,
    enableDynamicBonus,
    isBonusGloballyActive,
    bonusAmount,
    bonusPattern,
  } = useGameLogic({ stake, players, winAmount });

  const backgroundStyle = backgroundOptions.find(
    (bg) => bg.value === selectedBackground
  )?.style || { backgroundColor: "#111827" };

  const handleBack = () => {
    navigate("/dashboard", { state: { gameId: gameData?.game.gameId } });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "#fff",
        p: { xs: 1, sm: 1, md: 1 },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...backgroundStyle,
      }}
    >
      <style>{pulseAnimation}</style>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              color: "red",
              size: "34rm",
              zIndex: 10,
            }}
          >
            <FaTimes size={43} />
          </IconButton>
          <TopBar
            isPlaying={isPlaying}
            isShuffling={isShuffling}
            isReady={isReady}
            hasGameStarted={hasGameStarted}
            togglePlayPause={togglePlayPause}
            handleShuffleClick={handleShuffleClick}
            handlePatternSelectOpen={handlePatternSelectOpen}
            patternAnchorEl={patternAnchorEl}
            handlePatternSelectClose={handlePatternSelectClose}
            voiceOptions={voiceOptions}
            voiceOption={voiceOption}
            handleVoiceChange={handleVoiceChange}
            drawSpeed={drawSpeed}
            setDrawSpeed={setDrawSpeed}
            cardIdInput={cardIdInput}
            setCardIdInput={setCardIdInput}
            checkWinner={checkWinner}
            handleReady={handleReady}
            handleReset={handleReset}
            stake={stake}
            players={players}
            winAmount={winAmount}
            backgroundOptions={backgroundOptions}
            selectedBackground={selectedBackground}
            handleBackgroundChange={handleBackgroundChange}
            primaryPattern={primaryPattern}
            setPrimaryPattern={setPrimaryPattern}
            secondaryPattern={secondaryPattern}
            setSecondaryPattern={setSecondaryPattern}
            patternLogic={patternLogic}
            setPatternLogic={setPatternLogic}
            handleBack={handleBack}
            isGameEnded={isGameEnded}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "row",
                md: "column",
              },
              gap: { xs: 2, md: 2 },
              mt: { xs: 1, md: 2 },
            }}
          >
            <LeftSection
              calledNumbers={calledNumbers}
              getBallColor={getBallColor}
              patterns={possiblePatterns}
              patternAnimationIndex={patternAnimationIndex}
              shuffling={isShuffling}
              dynamicBonusAmount={dynamicBonusAmount}
              enableDynamicBonus={enableDynamicBonus}
              isBonusGloballyActive={isBonusGloballyActive}
              bonusAmount={bonusAmount}
              bonusPattern={bonusPattern}
            />
            <RightSection
              callCount={callCount}
              prefixedNumber={prefixedNumber}
              currentNumber={currentNumber}
              previousNumber={previousNumber}
              patterns={possiblePatterns}
              patternAnimationIndex={patternAnimationIndex}
              recentCalls={recentCalls}
              winAmount={
                enableDynamicBonus ? winAmount - winAmount * 0.05 : winAmount
              }
              dynamicBonusAmount={dynamicBonusAmount}
              enableDynamicBonus={enableDynamicBonus}
              isBonusGloballyActive={isBonusGloballyActive}
              bonusAmount={bonusAmount}
              bonusPattern={bonusPattern}
            />
          </Box>
          <Box sx={{ mt: { xs: 2, sm: 3, md: 3 }, textAlign: "center" }}>
            {" "}
            {/* Responsive margin top */}
            <Button
              onClick={handleEndGame}
              disabled={!isGameEnded}
              sx={{
                bgcolor: isGameEnded ? "#16a34a" : "#4b5563",
                color: "#fff",
                "&:hover": { bgcolor: isGameEnded ? "#15803d" : "#4b5563" },
                px: { xs: 2, sm: 3, md: 4 }, // Responsive padding X
                py: { xs: 1, sm: 1, md: 1 }, // Responsive padding Y
                fontSize: { xs: "0.875rem", sm: "0.9rem", md: "1rem" }, // Responsive font size
              }}
            >
              ጨዋታዉን ይጨርሱ
            </Button>
          </Box>
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
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Game;
