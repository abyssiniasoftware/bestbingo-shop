import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import GameControlsBar from "../components/game/GameControlsBar";
import NewGameConfirmDialog from "../components/game/NewGameConfirmDialog";
import BingoGrid from "../components/game/BingoGrid";
import WinnerDialog from "../components/game/WinnerDialog";
import useGameLogic from "../hooks/useGameLogic";
import useGameStore from "../stores/gameStore";
import { BINGO_PATTERNS } from "../constants/constants";

// Status Badge matching styles.css .stat-box
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
    fontSize: "18px",
    fontFamily: "'poetsen', sans-serif",
    mx: 0.5,
    textTransform: "uppercase",
  }}>
    {label}{value ? ` ${value}` : ''}
  </Box>
);

// Recent Called Number Badge matching styles.css .last-called-num
const RecentBallBadge = ({ ball }) => {
  const letter = ball?.charAt(0) || "";
  const number = ball?.substring(1) || "";

  return (
    <Box sx={{
      background: "linear-gradient(to bottom, #fff521, #9d9302)",
      border: "1px solid #FFF521",
      px: 0.5,
      py: 0.25,
      color: "#000",
      borderRadius: "5px",
      fontSize: "15px",
      mx: 0.25,
      fontWeight: "bold",
    }}>
      {letter} {number}
    </Box>
  );
};

const Game = ({ stake: propStake, players: propPlayers, winAmount: propWinAmount, voiceOption: passedVoiceOption }) => {
  const params = useParams();
  const stake = propStake || params.stake || "";
  const players = propPlayers || params.players || "";
  const winAmount = propWinAmount || params.winAmount || "0";

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

  const hasReservation = gameData?.cartela?.length > 0;

  // Get letter and number from current call
  const currentLetter = currentNumber?.charAt(0) || "";
  const currentNum = currentNumber?.substring(1) || "0";

  // Letter colors for current ball border
  const letterBorderColors = {
    B: 'hsl(259, 100%, 50%)', // purple
    I: '#E91E63', // pink
    N: 'hsl(237, 100%, 50%)', // blue
    G: '#dbcd0a', // yellow
    O: '#2fe91e', // green
  };

  return (
    <Box
      className="bingo-container"
      sx={{
        ml: 1.5,
        mt: 1,
        color: "#fff",
        fontFamily: "'poetsen', sans-serif",
      }}
    >
      {/* BINGO Header with stat boxes - matching styles.css .bingo-stat */}
      <Box className="bingo-stat" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography sx={{
          fontFamily: "'jaro', sans-serif",
          fontSize: "3.5rem",
          fontWeight: "bold",
          color: "white",
          textTransform: "uppercase",
          mr: 1,
        }}>
          BINGO
        </Typography>
        <StatusBadge label={isPlaying ? "GAME PLAYING" : "GAME"} />
        <StatusBadge label="STAKE" value={stake} />
        <StatusBadge label="WIN PRICE" value={winAmount} />
        <StatusBadge label={`${callCount} CALLED`} />
      </Box>

      {/* Main Panel: 85% grid, 15% current ball - matching styles.css .bingo-panel */}
      <Box
        className="bingo-panel"
        sx={{
          display: "grid",
          gridTemplateColumns: "85% 15%",
          gap: 1.25,
        }}
      >
        {/* Left: Bingo Grid */}
        <Box>
          <BingoGrid
            calledNumbers={calledNumbers}
            shuffling={isShuffling}
          />
        </Box>

        {/* Right: Current Ball + Recent Calls */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Large Current Ball - matching styles.css .last-called */}
          <Box sx={{
            fontSize: "50px",
            color: "#000",
            border: `10px solid ${letterBorderColors[currentLetter] || '#ffc839'}`,
            borderRadius: "50%",
            background: "linear-gradient(to bottom, #ffc839, #e4840c)",
            textAlign: "center",
            m: 1,
            p: 2.5,
            boxShadow: "10px 10px 10px rgba(0, 0, 0, 0.5), 0 0 6px rgba(0, 0, 0, 0.4) inset",
            transition: "background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
            width: 120,
            height: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Typography sx={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              lineHeight: 1,
              m: 0,
              color: "#000"
            }}>
              {currentLetter || "B"}
            </Typography>
            <Typography sx={{
              fontSize: "3rem",
              fontWeight: "bold",
              lineHeight: 1,
              m: 0,
              color: "#000"
            }}>
              {currentNum || "1"}
            </Typography>
          </Box>

          {/* Recent Calls - matching styles.css .last-called-numbers */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 1, flexWrap: "wrap" }}>
            {recentCalls.slice(0, 4).map((num, idx) => (
              <RecentBallBadge key={idx} ball={num} />
            ))}
          </Box>

          {/* View All Link */}
          <Typography
            sx={{
              mt: 0.5,
              cursor: "pointer",
              fontSize: "14px",
              color: "#000",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" }
            }}
          >
            view all
          </Typography>
        </Box>
      </Box>

      {/* Action Panel: 65% controls, 35% win money - matching styles.css .action-panel */}
      <Box
        className="action-panel"
        sx={{
          display: "grid",
          gridTemplateColumns: "65% 35%",
          gap: 1.25,
          mt: 2.5,
        }}
      >
        {/* Left: Controls */}
        <Box>
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

        {/* Right: WIN MONEY - matching styles.css .winner */}
        <Box
          className="winner"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            fontSize: "50px",
            color: "#fff",
          }}
        >
          <Box sx={{ textAlign: "right", mr: 1 }}>
            <Typography sx={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              fontFamily: "'poetsen', sans-serif",
              color: "white",
              lineHeight: 1,
            }}>
              WIN MONEY
            </Typography>
            <Typography sx={{
              fontSize: "2rem",
              fontWeight: "bold",
              fontFamily: "'poetsen', sans-serif",
              color: "white",
            }}>
              {winAmount} Birr
            </Typography>
          </Box>
          <img
            src="/icon/money.png"
            alt="Money"
            style={{ height: 120 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          textAlign: "center",
          color: "#fff",
          mt: 2,
          pb: 1,
        }}
      >
        © 2024 Dallol Technologies. All rights reserved.
      </Box>

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
