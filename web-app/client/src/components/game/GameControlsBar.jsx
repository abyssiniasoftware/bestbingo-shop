import React from "react";
import {
  Box,
  TextField,
  Button,
  Slider,
  Checkbox,
  FormControlLabel,
  styled,
  Typography,
} from "@mui/material";

const StyledControlButton = styled(Button)(({ bg }) => ({
  background: bg || "linear-gradient(to bottom, #4fc3f7, #0288d1)",
  color: "white",
  fontWeight: "900",
  fontSize: "1rem",
  padding: "10px 20px",
  borderRadius: "8px",
  textTransform: "uppercase",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  minWidth: "140px",
  "&:hover": {
    opacity: 0.9,
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    background: "#90a4ae",
    color: "rgba(255,255,255,0.7)",
  }
}));


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
  isManual,
  setIsManual,
  isAutomatic,
  setIsAutomatic,
  onNewGameClick,
  handleBack,
  handleEndGame,
}) => {

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && cardIdInput && !isPlaying) {
      checkWinner();
    }
  };

  return (
    <Box
      className="game-controls-bar"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4,
        padding: "20px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "15px",
        flexWrap: "wrap",
      }}
    >
      {/* Main Buttons group */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <StyledControlButton
          onClick={togglePlayPause}
          bg={isPlaying
            ? "linear-gradient(to bottom, #ff5252, #c62828)"
            : "linear-gradient(to bottom, #4caf50, #2e7d32)"}
        >
          {isPlaying ? "Stop Auto Play" : "Start Auto Play"}
        </StyledControlButton>

        <StyledControlButton
          onClick={() => {/* Trigger manual call logic if separate */ }}
          bg="linear-gradient(to bottom, #ffa726, #f57c00)"
          disabled={isPlaying}
        >
          Call Next
        </StyledControlButton>

        <StyledControlButton
          onClick={handleEndGame}
          bg="linear-gradient(to bottom, #5c6bc0, #3949ab)"
        >
          Finish
        </StyledControlButton>

        <StyledControlButton
          onClick={handleShuffleClick}
          disabled={isPlaying || hasGameStarted}
          bg="linear-gradient(to bottom, #ab47bc, #8e24aa)"
        >
          Shuffle
        </StyledControlButton>
      </Box>

      {/* Speed & Auto group */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexGrow: 1, justifyContent: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: 250 }}>
          <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "0.9rem", minWidth: 100 }}>
            Auto call speed:
          </Typography>
          <Slider
            value={drawSpeed}
            onChange={(e, newValue) => setDrawSpeed(newValue)}
            min={2000}
            max={7500}
            step={500}
            sx={{
              color: "#fff",
              "& .MuiSlider-thumb": { width: 16, height: 16, backgroundColor: "#fff" },
              "& .MuiSlider-track": { backgroundColor: "#fff" },
              "& .MuiSlider-rail": { backgroundColor: "rgba(255,255,255,0.3)" },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={isManual} onChange={(e) => setIsManual(e.target.checked)} sx={{ color: "white", '&.Mui-checked': { color: 'white' } }} />}
            label={<Typography sx={{ color: "white", fontWeight: "bold" }}>Manual</Typography>}
          />
          <FormControlLabel
            control={<Checkbox checked={isAutomatic} onChange={(e) => setIsAutomatic(e.target.checked)} sx={{ color: "white", '&.Mui-checked': { color: 'white' } }} />}
            label={<Typography sx={{ color: "white", fontWeight: "bold" }}>Auto</Typography>}
          />
        </Box>
      </Box>

      {/* Card input group */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          placeholder="Enter Card Number"
          value={cardIdInput}
          onChange={(e) => setCardIdInput(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              background: "white",
              borderRadius: "8px",
              width: 180,
              "& fieldset": { border: "none" },
            },
          }}
        />
        <Button
          onClick={checkWinner}
          variant="contained"
          sx={{
            background: "#4caf50",
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 3,
            "&:hover": { background: "#43a047" },
          }}
        >
          Check
        </Button>
      </Box>
    </Box>

  );
};

export default GameControlsBar;
