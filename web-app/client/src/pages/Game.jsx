import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import GameControlsBar from "../components/game/GameControlsBar";
import NewGameConfirmDialog from "../components/game/NewGameConfirmDialog";
import BingoGrid from "../components/game/BingoGrid";
import WinnerDialog from "../components/game/WinnerDialog";
import { pulseAnimation } from "../components/game/GameStyles";
import useGameLogic from "../hooks/useGameLogic";
import useGameStore from "../stores/gameStore";
import {
  BINGO_PATTERNS,
} from "../constants/constants";

import { money } from "../images/icon";

// Status Badge Component matching screenshot design
const StatusBadge = ({ label, value }) => (
  <Box sx={{
    background: "linear-gradient(to bottom, #fff521, #9d9302)",
    border: "2px solid #FFF521",
    color: "#000",
    px: 1.5,
    py: 0.5,
    borderRadius: "5px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    textTransform: "uppercase",
    fontSize: "0.85rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    height: "fit-content",
    fontFamily: "'Roboto', sans-serif",
  }}>
    <Typography sx={{ fontWeight: "700", color: "#333", fontSize: "0.75rem" }}>{label}</Typography>
    {value && <Typography sx={{ fontWeight: "900", fontSize: "0.9rem" }}>{value}</Typography>}
  </Box>
);

// Recent Balls Tag Component
const RecentBallTag = ({ ball }) => {
  const letter = ball?.charAt(0) || "";
  const number = ball?.substring(1) || "";

  const letterColors = {
    B: "#8a00ff",
    I: "#E91E63",
    N: "#0037ff",
    G: "#dbcd0a",
    O: "#2fe91e"
  };

  return (
    <Box sx={{
      background: "linear-gradient(to bottom, #fff521, #9d9302)",
      border: `1px solid ${letterColors[letter] || "#FFF521"}`,
      px: 0.8,
      py: 0.2,
      borderRadius: "5px",
      fontWeight: "bold",
      fontSize: "0.75rem",
      color: "#000",
      minWidth: 35,
      textAlign: "center"
    }}>
      {letter} {number}
    </Box>
  );
};

const Game = ({ stake: propStake, players: propPlayers, winAmount: propWinAmount, voiceOption: passedVoiceOption }) => {
  const params = useParams();
  const stake = propStake || params.stake;
  const players = propPlayers || params.players;
  const winAmount = propWinAmount || params.winAmount;

  const navigate = useNavigate();
  const { gameData } = useGameStore();
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
    isGameEnded,
    hasGameStarted,
    checkWinner,
    handleEndGame,
    handleShuffleClick,
    handleCloseModal,
    clearLockedCards,
    togglePlayPause,
    bonusAwarded,
    bonusAmountGiven,
    isManual,
    setIsManual,
    isAutomatic,
    setIsAutomatic,
    declareWinnerManually,
    handleReset,
    primaryPattern,
    setLockedCards,
    playWinnerAudio,
    playLoseAudio,
    callNextNumber,
  } = useGameLogic(stake, players, winAmount, passedVoiceOption);

  const [openNewGameConfirm, setOpenNewGameConfirm] = useState(false);

  const handleBack = () => {
    navigate("/new-game", { state: { gameId: gameData?.game.gameId } });
  };

  const handleNewGameClick = () => {
    if (hasGameStarted) {
      setOpenNewGameConfirm(true);
    } else {
      navigate("/new-game");
    }
  };

  // Check if there's a reservation (cards selected)
  const hasReservation = gameData?.cartela?.length > 0;

  // Get letter for current number
  const currentLetter = currentNumber?.charAt(0) || "";
  const currentNum = currentNumber?.substring(1) || "";

  // Letter color mapping matching screenshots
  const letterColors = {
    B: { border: "#8a00ff", text: "#8a00ff" },
    I: { border: "#E91E63", text: "#E91E63" },
    N: { border: "#0037ff", text: "#0037ff" },
    G: { border: "#dbcd0a", text: "#333" },
    O: { border: "#2fe91e", text: "#2fe91e" }
  };

  return (
    <Box
      sx={{
        height: "100%",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        background: "var(--content-bg, #00b2ff)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <style>{pulseAnimation}</style>

      {/* Header Section */}
      <Box sx={{ px: 3, py: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "900",
            color: "white",
            textShadow: "3px 3px 0px rgba(0,0,0,0.15)",
            fontSize: "2.5rem",
            fontFamily: "'Arial Black', sans-serif"
          }}
        >
          BINGO
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <StatusBadge label={isPlaying ? "GAME PLAYING" : "GAME"} />
          <StatusBadge label="STAKE" value={stake || ""} />
          <StatusBadge label="WIN PRICE" value={winAmount || ""} />
          <StatusBadge label={`${callCount} CALLED`} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ display: "flex", flexGrow: 1, px: 3, gap: 3, overflow: "hidden" }}>
        {/* Left: Bingo Grid */}
        <Box sx={{ flex: "1 1 75%", overflow: "auto" }}>
          <BingoGrid calledNumbers={calledNumbers} shuffling={isShuffling} />
        </Box>

        {/* Right: Current Ball + Recent Calls + Win Money */}
        <Box sx={{
          flex: "0 0 200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 1
        }}>
          {/* Large Current Ball */}
          <Box
            sx={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #fff176 0%, #ffc107 40%, #e65100 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 15px 30px rgba(0,0,0,0.4), inset 0 -6px 12px rgba(0,0,0,0.25), inset 0 6px 12px rgba(255,255,255,0.35)",
              border: "6px solid #ffcc80",
              position: "relative",
            }}
          >
            <Typography sx={{
              fontSize: "2rem",
              fontWeight: "900",
              color: letterColors[currentLetter]?.text || "#000",
              lineHeight: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)"
            }}>
              {currentLetter || "B"}
            </Typography>
            <Typography sx={{
              fontSize: "3.5rem",
              fontWeight: "900",
              color: "#000",
              lineHeight: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              mt: -0.5
            }}>
              {currentNum || "1"}
            </Typography>
          </Box>

          {/* Recent Balls Strip */}
          <Box sx={{ mt: 2, width: "100%" }}>
            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap", mb: 0.5 }}>
              {recentCalls.slice(0, 4).map((num, idx) => (
                <RecentBallTag key={idx} ball={num} />
              ))}
            </Box>
            <Typography
              sx={{
                color: "#333",
                fontSize: "0.7rem",
                textAlign: "center",
                cursor: "pointer",
                textDecoration: "underline",
                "&:hover": { color: "#000" }
              }}
            >
              view all
            </Typography>
          </Box>

          {/* WIN MONEY Section */}
          <Box sx={{
            mt: "auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <Typography sx={{
              fontSize: "1.8rem",
              fontWeight: "900",
              color: "white",
              textShadow: "2px 2px 0 rgba(0,0,0,0.2)",
              fontFamily: "'Arial Black', sans-serif",
              lineHeight: 1.1
            }}>
              WIN MONEY
            </Typography>
            <Typography sx={{
              fontSize: "1.5rem",
              fontWeight: "900",
              color: "white",
              textShadow: "2px 2px 0 rgba(0,0,0,0.2)",
              fontFamily: "'Arial Black', sans-serif"
            }}>
              {winAmount || "0"} Birr
            </Typography>
            <img
              src={money}
              alt="Money"
              style={{
                height: 100,
                objectFit: "contain",
                marginTop: 8
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Bottom Controls Bar */}
      <Box sx={{ px: 3, py: 1.5 }}>
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
          hasReservation={hasReservation}
          onNewGameClick={handleNewGameClick}
          onCallNext={callNextNumber}
        />
      </Box>

      {/* Footer */}
      <Typography sx={{
        textAlign: "center",
        color: "white",
        fontSize: "0.7rem",
        pb: 1,
        opacity: 0.8
      }}>
        © {new Date().getFullYear()} Dallol Technologies. All rights reserved.
      </Typography>

      {/* New Game Confirmation Modal */}
      <NewGameConfirmDialog
        open={openNewGameConfirm}
        onClose={() => setOpenNewGameConfirm(false)}
        onConfirm={() => {
          handleReset();
          setOpenNewGameConfirm(false);
        }}
      />

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
