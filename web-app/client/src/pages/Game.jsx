import { useParams, useNavigate } from "react-router-dom";
import GameControlsBar from "../components/game/GameControlsBar";
import BingoGrid from "../components/game/BingoGrid";
import WinnerDialog from "../components/game/WinnerDialog";
import useGameLogic from "../hooks/useGameLogic";
import useGameStore from "../stores/gameStore";
import { BINGO_PATTERNS } from "../constants/constants";
import {
  money as MoneyIcon
} from "../images/icon";
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

  const handleBack = () => {
    navigate("/new-game", { state: { gameId: gameData?.game.gameId } });
  };

  const handleNewGameClick = () => {
    handleReset();
    navigate("/new-game");
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

  // Only show current ball section when there are calls
  const showCurrentBall = callCount > 0;

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
        <span className="stat-box">WIN PRICE {winAmount > 0 ? winAmount : ""}</span>
        <span className="stat-box">{callCount} CALLED</span>
      </div>

      {/* Main Panel: grid layout depends on whether current ball is shown */}
      <div
        className="bingo-panel"
      >

        {/* Left: Bingo Grid */}
        <BingoGrid
          calledNumbers={calledNumbers}
          shuffling={isShuffling}
        />

        {/* Right: Current Ball + Recent Calls - Only shown when there are calls */}
        {showCurrentBall && (
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
        )}
      </div>

      {/* Action Panel: 65% controls, 35% win money */}
      <div className="action-panel">
        {/* Left: Controls */}
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
          callCount={callCount}
        />
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
            src={MoneyIcon}
            alt="Money"
            style={{ height: 150 }}
            onError={(e) => { e.target.src = MoneyIcon; }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer
        className="cashier-footer"
        style={{
          textAlign: "center",
          marginTop: 6,
          padding: "12px 8px",
          fontSize: "0.875rem",
        }}
      >
        © {new Date().getFullYear()} Abyssinia Software Technology PLC. All Rights Reserved.
      </footer>


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
        onNewGameClick={handleNewGameClick}
        playWinnerAudio={playWinnerAudio}
        playLoseAudio={playLoseAudio}
      />
    </div>
  );
};

export default Game;
