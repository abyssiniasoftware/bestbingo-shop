import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, IconButton, Button, Dialog, DialogContent, Typography } from "@mui/material";
import GameTopSection from "../components/game/GameTopSection";
import GameControlsBar from "../components/game/GameControlsBar";
import NewGameConfirmDialog from "../components/game/NewGameConfirmDialog";
import BingoGrid from "../components/game/BingoGrid";
import WinnerDialog from "../components/game/WinnerDialog";
import CentralBallOverlay from "../components/game/CentralBallOverlay";
import { pulseAnimation } from "../components/game/GameStyles";
import useGameLogic from "../hooks/useGameLogic";
import useGameStore from "../stores/gameStore";
import {
  BINGO_PATTERNS,
} from "../constants/constants";

import { money } from "../images/icon";

const StatusBadge = ({ label, value }) => (
  <Box sx={{
    background: "#ffeb3b",
    color: "#000",
    px: 1.5,
    py: 0.5,
    borderRadius: "8px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 1,
    textTransform: "uppercase",
    fontSize: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    height: "fit-content",
  }}>
    <Typography variant="caption" sx={{ fontWeight: "900", color: "#333", fontSize: "0.8rem" }}>{label}</Typography>
    {value && <Typography sx={{ fontWeight: "900", fontSize: "1.2rem" }}>{value}</Typography>}
  </Box>
);


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
  } = useGameLogic(stake, players, winAmount, passedVoiceOption);




  const [openNewGameConfirm, setOpenNewGameConfirm] = useState(false);


  const handleBack = () => {
    navigate("/new-game", { state: { gameId: gameData?.game.gameId } });
  };


  // Check if there's a reservation (cards selected)
  // And if we have basic game data to render
  const hasReservation = gameData?.cartela?.length > 0;
  console.log("reservation found", hasReservation)

  return (
    <Box
      sx={{
        height: "100%",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        background: "#00b2ff",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <style>{pulseAnimation}</style>

      {/* Header Section */}
      <Box sx={{ px: 4, py: 2, display: "flex", alignItems: "center", gap: 3 }}>
        <Typography variant="h2" sx={{ fontWeight: "900", color: "white", textShadow: "4px 4px 0px rgba(0,0,0,0.1)" }}>
          BINGO
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <StatusBadge label={isPlaying ? "GAME PLAYING" : "GAME PAUSED"} />
          <StatusBadge label="STAKE" value={stake} />
          <StatusBadge label="WIN PRICE" value={winAmount} />
          <StatusBadge label={`${callCount} CALLED`} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ display: "flex", flexGrow: 1, px: 4, gap: 4, overflow: "hidden" }}>
        {/* Left: Bingo Grid (75%) */}
        <Box sx={{ flex: 3.5, overflow: "auto" }}>
          <BingoGrid calledNumbers={calledNumbers} shuffling={isShuffling} />
        </Box>

        {/* Right: Current Ball and Recent (1.5) */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {/* Large Current Ball */}
          <Box
            sx={{
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #fff176 0%, #ffc107 40%, #e65100 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 -8px 15px rgba(0,0,0,0.3), inset 0 8px 15px rgba(255,255,255,0.4)",
              border: "8px solid #ffcc80",
              mb: 2,
              position: "relative",
            }}
          >
            <Typography sx={{ fontSize: "5rem", fontWeight: "900", color: "#000", lineHeight: 1, textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              {currentNumber?.charAt(0) || "B"}
            </Typography>
            <Typography sx={{ fontSize: "8rem", fontWeight: "900", color: "#000", lineHeight: 1, textShadow: "0 2px 4px rgba(0,0,0,0.2)", mt: -2 }}>
              {currentNumber?.substring(1) || "1"}
            </Typography>
          </Box>


          {/* Recent Balls Strip (integrated here) */}
          <Box sx={{ width: "100%", mt: 2 }}>
            {/* Pass minimal recent balls view */}
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 1 }}>
              {recentCalls.slice(0, 3).map((num, idx) => (
                <Box key={idx} sx={{ background: "#ffeb3b", color: "#333", px: 1, borderRadius: "4px", fontWeight: "bold", fontSize: "0.8rem" }}>
                  {num}
                </Box>
              ))}
            </Box>
            <Typography sx={{ color: "white", fontSize: "0.8rem", textAlign: "center", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              view all
            </Typography>
          </Box>

          {/* Money Image at bottom right of this section */}
          <Box sx={{ mt: "auto", alignSelf: "flex-end" }}>
            <img src={money} alt="Money" style={{ height: 150 }} />
          </Box>
        </Box>
      </Box>

      {/* Bottom Controls Bar */}
      <Box sx={{ px: 4, py: 2 }}>
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
          isManual={isManual}
          setIsManual={setIsManual}
          isAutomatic={isAutomatic}
          setIsAutomatic={setIsAutomatic}
          onNewGameClick={() => setOpenNewGameConfirm(true)}
        />



      </Box>

      {/* Footer */}
      <Typography sx={{ textAlign: "center", color: "white", fontSize: "0.75rem", pb: 1, opacity: 0.8 }}>
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
