import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Slider,
  styled,
  Typography,
} from "@mui/material";

const ControlButton = styled(Button)(({ theme, variant: btnVariant }) => {
  const variants = {
    yellow: {
      background: "linear-gradient(to bottom, #fff521, #9d9302)",
      border: "2px solid #FFF521",
      color: "#000000",
    },
    green: {
      background: "linear-gradient(to bottom, #4caf50, #2e7d32)",
      border: "2px solid #4caf50",
      color: "#ffffff",
    },
    red: {
      background: "linear-gradient(to bottom, #ff5252, #c62828)",
      border: "2px solid #ff5252",
      color: "#ffffff",
    },
    blue: {
      background: "linear-gradient(to bottom, #039be5, #01579b)",
      border: "2px solid #039be5",
      color: "#ffffff",
    },
    purple: {
      background: "linear-gradient(to bottom, #7e57c2, #4527a0)",
      border: "2px solid #7e57c2",
      color: "#ffffff",
    },
    olive: {
      background: "linear-gradient(to bottom, #a4b545, #6b7730)",
      border: "2px solid #a4b545",
      color: "#000000",
    },
    disabled: {
      background: "#90a4ae",
      border: "2px solid #78909c",
      color: "rgba(255,255,255,0.7)",
    }
  };

  const style = variants[btnVariant] || variants.yellow;

  return {
    ...style,
    fontWeight: "900",
    fontSize: "0.85rem",
    padding: "8px 16px",
    borderRadius: "5px",
    textTransform: "uppercase",
    fontFamily: "'Roboto', sans-serif",
    letterSpacing: "0.5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    minWidth: "auto",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    "&:hover": {
      opacity: 0.9,
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    },
    "&:disabled": {
      ...variants.disabled,
      cursor: "not-allowed",
      transform: "none",
    }
  };
});

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
  // Track if autoplay has ever been started this game session
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

  // Determine which set of controls to show
  const showFullControls = hasReservation && hasGameStarted && !isGameEnded;

  return (
    <Box
      className="game-controls-bar"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Main Controls Row */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5
      }}>
        {/* Left: Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          {showFullControls ? (
            <>
              {/* Full control set when game is active with reservation */}
              <ControlButton
                variant={isPlaying ? "red" : "yellow"}
                onClick={handleAutoPlayToggle}
              >
                {isPlaying ? "Stop Auto Play" : "Start Auto Play"}
              </ControlButton>

              <ControlButton
                variant="yellow"
                onClick={onCallNext}
                disabled={autoplayEverStarted || isPlaying}
              >
                Call Next
              </ControlButton>

              <ControlButton
                variant="yellow"
                onClick={handleEndGame}
              >
                Finish
              </ControlButton>

              <ControlButton
                variant="olive"
                onClick={handleShuffleClick}
                disabled={isPlaying || hasGameStarted}
              >
                {isShuffling ? "Stop" : "Shuffle"}
              </ControlButton>
            </>
          ) : (
            <>
              {/* Limited controls when no reservation or game not started */}
              <ControlButton
                variant="yellow"
                onClick={onNewGameClick}
              >
                Start New Game
              </ControlButton>

              <ControlButton
                variant="olive"
                onClick={handleShuffleClick}
                disabled={isPlaying}
              >
                {isShuffling ? "Stop" : "Shuffle"}
              </ControlButton>
            </>
          )}
        </Box>

        {/* Right side: Win Amount (shown inline on same row) */}
        {/* This space intentionally left for alignment - Win amount shown in Game.jsx */}
      </Box>

      {/* Second Row: Speed Slider + Card Input */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        flexWrap: "wrap"
      }}>
        {/* Speed Slider Group */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Slider
            value={drawSpeed}
            onChange={(e, newValue) => setDrawSpeed(newValue)}
            min={2000}
            max={7500}
            step={500}
            sx={{
              width: 150,
              color: "#4A90E2",
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                backgroundColor: "#fff",
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: "0 0 0 6px rgba(74, 144, 226, 0.3)"
                }
              },
              "& .MuiSlider-track": {
                backgroundColor: "#4A90E2",
                height: 4
              },
              "& .MuiSlider-rail": {
                backgroundColor: "rgba(255,255,255,0.3)",
                height: 4
              },
            }}
          />
          <Typography sx={{
            color: "white",
            fontSize: "0.8rem",
            fontWeight: "500",
            whiteSpace: "nowrap"
          }}>
            Auto call {speedInSeconds} seconds
          </Typography>
        </Box>

        {/* Card Input + Check Button */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            placeholder="Enter cartela"
            value={cardIdInput}
            onChange={(e) => setCardIdInput(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(225, 215, 23, 0.5)",
                borderRadius: "5px",
                width: 140,
                height: 36,
                "& fieldset": { border: "1px solid #ccc" },
                "& input": {
                  color: "#000",
                  fontSize: "0.85rem",
                  padding: "8px 12px",
                  "&::placeholder": { color: "#666", opacity: 1 }
                },
              },
            }}
          />
          <ControlButton
            variant="blue"
            onClick={checkWinner}
          >
            Check
          </ControlButton>
        </Box>
      </Box>
    </Box>
  );
};

export default GameControlsBar;
