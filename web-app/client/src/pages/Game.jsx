import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameControlsBar from "../components/game/GameControlsBar";
import NewGameConfirmDialog from "../components/game/NewGameConfirmDialog";
import BingoGrid from "../components/game/BingoGrid";
import WinnerDialog from "../components/game/WinnerDialog";
import useGameLogic from "../hooks/useGameLogic";
import useGameStore from "../stores/gameStore";
import { BINGO_PATTERNS } from "../constants/constants";

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

  // Letter border colors
  const letterBorderColors = {
    B: 'hsl(259, 100%, 50%)',
    I: '#E91E63',
    N: 'hsl(237, 100%, 50%)',
    G: '#dbcd0a',
    O: '#2fe91e',
  };

  return (
    <div className="bingo-container">
      {/* BINGO Header with stat boxes */}
      <div className="bingo-stat">
        <span style={{
          fontFamily: "'jaro', sans-serif",
          fontSize: "3.5rem",
          fontWeight: "bold",
          color: "white",
          textTransform: "uppercase",
          marginRight: 10,
        }}>
          BINGO
        </span>
        <span className="stat-box">{isPlaying ? "GAME PLAYING" : "GAME"}</span>
        <span className="stat-box">STAKE {stake}</span>
        <span className="stat-box">WIN PRICE {winAmount}</span>
        <span className="stat-box">{callCount} CALLED</span>
      </div>

      {/* Main Panel: 85% grid, 15% current ball */}
      <div className="bingo-panel">
        {/* Left: Bingo Grid */}
        <div>
          <BingoGrid
            calledNumbers={calledNumbers}
            shuffling={isShuffling}
          />
        </div>

        {/* Right: Current Ball + Recent Calls */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Large Current Ball */}
          <div
            className="last-called"
            style={{ borderColor: letterBorderColors[currentLetter] || '#ffc839' }}
          >
            <p id="last-letter">{currentLetter || "B"}</p>
            <p>{currentNum || "1"}</p>
          </div>

          {/* Recent Calls */}
          <div className="last-called-numbers">
            {recentCalls.slice(0, 4).map((num, idx) => (
              <span
                key={idx}
                className="last-called-num"
                data-letter={num?.charAt(0)}
              >
                {num}
              </span>
            ))}
          </div>

          {/* View All Link */}
          <div className="view-all">
            <button
              id="viewAllCalledButton"
              style={{
                backgroundColor: 'transparent',
                color: '#000',
                fontSize: 14,
                border: 'none',
                padding: '5px',
                cursor: 'pointer',
              }}
            >
              view all
            </button>
          </div>
        </div>
      </div>

      {/* Action Panel: 65% controls, 35% win money */}
      <div className="action-panel">
        {/* Left: Controls */}
        <div>
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
        </div>

        {/* Right: WIN MONEY */}
        <div className="winner">
          <div style={{ textAlign: "right", marginRight: 10 }}>
            <div style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              fontFamily: "'poetsen', sans-serif",
            }}>
              WIN MONEY
            </div>
            <div style={{
              fontSize: "2rem",
              fontWeight: "bold",
              fontFamily: "'poetsen', sans-serif",
            }}>
              {winAmount} Birr
            </div>
          </div>
          <img
            src="/static/game/icon/money.png"
            alt="Money"
            style={{ height: 150 }}
            onError={(e) => { e.target.src = '/icon/money.png'; }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="cashier-footer" style={{ textAlign: "center", marginTop: 16, paddingBottom: 8 }}>
        © 2024 Dallol Technologies. All rights reserved.
      </footer>

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
    </div>
  );
};

export default Game;
