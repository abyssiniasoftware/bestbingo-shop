import React, { useState } from "react";
import { Box, TextField, Slider, Typography } from "@mui/material";

// Control Button matching styles.css .cutm-btn-2 (dark teal style from screenshots)
const ControlButton = ({ children, onClick, disabled, variant = "default" }) => {
  const styles = {
    default: {
      background: 'transparent',
      border: '2px solid rgba(255,255,255,0.5)',
      color: '#ffffff',
    },
    primary: {
      background: 'transparent',
      border: '2px solid rgba(255,255,255,0.5)',
      color: '#ffffff',
    },
    stop: {
      background: 'rgba(255,50,50,0.3)',
      border: '2px solid #ff5252',
      color: '#ffffff',
    }
  };

  const style = styles[variant] || styles.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...style,
        padding: '8px 16px',
        borderRadius: '5px',
        fontSize: '16px',
        fontFamily: "'poetsen', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        textAlign: 'center',
        opacity: disabled ? 0.5 : 1,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginRight: 8,
      }}
    >
      {children}
    </button>
  );
};

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

  // Determine which controls to show
  const showFullControls = hasReservation && hasGameStarted && !isGameEnded;

  return (
    <Box className="controls-section">
      {/* Actions Row - matching styles.css .actions */}
      <Box
        className="actions"
        sx={{
          display: "flex",
          mb: 2,
        }}
      >
        {showFullControls ? (
          <>
            <ControlButton onClick={handleAutoPlayToggle}>
              {isPlaying ? "STOP AUTO PLAY" : "START AUTO PLAY"}
            </ControlButton>
            <ControlButton
              onClick={onCallNext}
              disabled={autoplayEverStarted || isPlaying}
            >
              CALL NEXT
            </ControlButton>
            <ControlButton onClick={handleEndGame}>
              FINSH
            </ControlButton>
            <ControlButton
              onClick={handleShuffleClick}
              disabled={isPlaying || hasGameStarted}
            >
              {isShuffling ? "STOP" : "SHUFFLE"}
            </ControlButton>
          </>
        ) : (
          <>
            <ControlButton onClick={onNewGameClick}>
              START NEW GAME
            </ControlButton>
            <ControlButton onClick={handleShuffleClick}>
              {isShuffling ? "STOP" : "SHUFFLE"}
            </ControlButton>
          </>
        )}
      </Box>

      {/* Form Group Row - matching styles.css .form-group */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Speed Slider - matching styles.css input[type="range"] */}
        <Box className="form-group">
          <input
            type="range"
            value={drawSpeed}
            onChange={(e) => setDrawSpeed(parseInt(e.target.value))}
            min={2000}
            max={7500}
            step={500}
            style={{
              WebkitAppearance: 'none',
              appearance: 'none',
              background: 'transparent',
              cursor: 'pointer',
              width: 170,
            }}
          />
          <Typography sx={{
            color: "white",
            fontSize: "14px",
            fontFamily: "'poetsen', sans-serif",
            mt: 0.5,
          }}>
            Auto call {speedInSeconds} secounds
          </Typography>
        </Box>

        {/* Card Input - matching styles.css .actions input[type="number"] */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          <ControlButton onClick={checkWinner}>
            CHECK
          </ControlButton>
        </Box>
      </Box>
    </Box>
  );
};

export default GameControlsBar;
