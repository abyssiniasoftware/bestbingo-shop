import React, { useState } from "react";

// Control buttons matching styles.css .cutm-btn (yellow gradient)
const GameControlsBar = ({
  isPlaying,
  isShuffling,
  togglePlayPause,
  handleShuffleClick,
  drawSpeed,
  setDrawSpeed,
  cardIdInput,
  setCardIdInput,
  checkWinner,
  hasGameStarted,
  handleEndGame,
  hasReservation,
  isGameEnded,
  onNewGameClick,
  onCallNext,
  callCount = 0,
}) => {
  const [autoplayEverStarted, setAutoplayEverStarted] = useState(false);

  const handleAutoPlayToggle = () => {
    if (!isPlaying) {
      setAutoplayEverStarted(true);
    }
    togglePlayPause();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && cardIdInput) {
      checkWinner();
    }
  };

  // Convert drawSpeed (ms) to seconds for display
  const speedInSeconds = Math.round(drawSpeed / 1000);

  // Determine which controls to show based on game state
  // Screenshot 0: No reservation => START NEW GAME + STOP (shuffle)
  // Screenshot 1: Has reservation, 0 calls (after reservation, before start) => Full controls
  // Screenshot 2: Has reservation, calls made => Full controls with CALL NEXT disabled if autoplay started
  const showFullControls = hasReservation && !isGameEnded;

  return (
    <div className="controls-section">
      {/* Actions Row */}
      <div className="actions">
        {showFullControls ? (
          <>
            <button
              className="cutm-btn"
              id="start-auto-play"
              onClick={handleAutoPlayToggle}
            >
              {isPlaying ? "STOP AUTO PLAY" : "START AUTO PLAY"}
            </button>
            <button
              className={`cutm-btn ${(autoplayEverStarted || isPlaying) ? 'inactive' : ''}`}
              id="call-next"
              onClick={onCallNext}
              disabled={autoplayEverStarted || isPlaying}
            >
              CALL NEXT
            </button>
            <button
              className="cutm-btn"
              id="finsh"
              onClick={handleEndGame}
            >
              FINSH
            </button>
            <button
              className={`cutm-btn ${(isPlaying || callCount > 0) ? 'inactive' : ''}`}
              id="shuffle"
              onClick={handleShuffleClick}
              disabled={isPlaying || callCount > 0}
            >
              {isShuffling ? "STOP" : "SHUFFLE"}
            </button>
          </>
        ) : (
          <>
            <button
              className="cutm-btn"
              id="start-new-game"
              onClick={onNewGameClick}
            >
              START NEW GAME
            </button>
            <button
              className="cutm-btn"
              id="shuffle"
              onClick={handleShuffleClick}
            >
              {isShuffling ? "STOP" : "SHUFFLE"}
            </button>
          </>
        )}
      </div>

      {/* Form Group Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Speed Slider */}
        <div className="form-group">
          <input
            type="range"
            value={drawSpeed}
            onChange={(e) => setDrawSpeed(parseInt(e.target.value))}
            min={2000}
            max={7500}
            step={500}
          />
          <p style={{ color: "white", fontSize: 14, fontFamily: "'poetsen', sans-serif" }}>
            Auto call {speedInSeconds} secounds
          </p>
        </div>

        {/* Card Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="text"
            placeholder="Enter cartela"
            value={cardIdInput}
            onChange={(e) => setCardIdInput(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: 200,
              border: '1px solid #ccc',
              backgroundColor: 'rgba(225, 215, 23, 0.5)',
              borderRadius: 5,
              padding: '8px 10px',
              fontSize: 18,
              fontFamily: "'poetsen', sans-serif",
              color: '#000000',
            }}
          />
          <button className="cutm-btn" id="check-btn" onClick={checkWinner}>
            CHECK
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControlsBar;
