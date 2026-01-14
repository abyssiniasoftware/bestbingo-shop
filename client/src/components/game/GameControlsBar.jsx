import React from "react";
import {
  Box,
  TextField,
  Button,
  Slider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import "../../styles/game-redesign.css";

const GameControlsBar = ({
  isPlaying,
  isShuffling,
  togglePlayPause,
  handleShuffleClick,
  voiceOptions,
  voiceOption,
  handleVoiceChange,
  drawSpeed,
  setDrawSpeed,
  cardIdInput,
  setCardIdInput,
  checkWinner,
  handleBack,
  isGameEnded,
  hasGameStarted,
  isManual,
  setIsManual,
  isAutomatic,
  setIsAutomatic,
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
        gap: { xs: 1, sm: 2 },
        padding: { xs: "8px 12px", sm: "10px 15px" },
        background: "#1a1a1a",
        borderRadius: "8px",
        flexWrap: "wrap",
      }}
    >
      {/* Left group: Main action buttons */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Button
          onClick={togglePlayPause}
          sx={{
            background: isPlaying
              ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"
              : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            color: "white",
            fontWeight: "bold",
            padding: { xs: "6px 12px", sm: "8px 16px" },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            borderRadius: "4px",
            "&:hover": { transform: "translateY(-1px)" },
          }}
        >
          {isPlaying ? "Stop" : "Bingo"}
        </Button>

        <Button
          onClick={handleBack}
          disabled={hasGameStarted && !isGameEnded}
          sx={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "white",
            fontWeight: "bold",
            padding: { xs: "6px 12px", sm: "8px 16px" },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            borderRadius: "4px",
            "&:disabled": { background: "#4b5563", color: "#9ca3af" },
            "&:hover": { transform: "translateY(-1px)" },
          }}
        >
          Back
        </Button>

        <Button
          onClick={handleShuffleClick}
          disabled={isPlaying}
          sx={{
            background: isShuffling
              ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            color: "white",
            fontWeight: "bold",
            padding: { xs: "6px 12px", sm: "8px 16px" },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            borderRadius: "4px",
            "&:disabled": { background: "#4b5563", color: "#9ca3af" },
            "&:hover": { transform: "translateY(-1px)" },
          }}
        >
          Bowzew
        </Button>
      </Box>

      {/* Center group: Voice, Speed, Manual/Auto */}
      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        {/* Voice selector */}
        <select
          value={
            voiceOptions.find((option) => option.value === voiceOption)
              ?.label || ""
          }
          onChange={handleVoiceChange}
          className="voice-select"
          style={{
            padding: "8px 12px",
            background: "#374151",
            color: "white",
            border: "1px solid #4b5563",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}
        >
          {voiceOptions.map((option) => (
            <option key={option.value} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Speed slider */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Speed:</span>
          <Box sx={{ width: { xs: 60, sm: 80 } }}>
            <Slider
              value={drawSpeed}
              onChange={(e, newValue) => setDrawSpeed(newValue)}
              min={2000}
              max={7500}
              step={500}
              sx={{
                color: "#60a5fa",
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                },
              }}
            />
          </Box>
          <span style={{ color: "white", fontSize: "0.75rem" }}>
            {(drawSpeed / 1000).toFixed(0)}
          </span>
        </Box>

        {/* Manual/Automatic checkboxes */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isManual || false}
                onChange={(e) => setIsManual && setIsManual(e.target.checked)}
                sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#60a5fa" } }}
                size="small"
              />
            }
            label={
              <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                Manual
              </span>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isAutomatic || true}
                onChange={(e) =>
                  setIsAutomatic && setIsAutomatic(e.target.checked)
                }
                sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#60a5fa" } }}
                size="small"
              />
            }
            label={
              <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                Automatic
              </span>
            }
          />
        </Box>
      </Box>

      {/* Right group: Card input and Check */}
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
              background: "#374151",
              color: "white",
              fontSize: "0.875rem",
              "& fieldset": { borderColor: "#4b5563" },
              "&:hover fieldset": { borderColor: "#60a5fa" },
            },
            "& input::placeholder": { color: "#9ca3af" },
            width: { xs: 100, sm: 140 },
          }}
        />

        <Button
          onClick={checkWinner}
          disabled={!cardIdInput || isPlaying}
          sx={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            color: "white",
            fontWeight: "bold",
            padding: { xs: "6px 12px", sm: "8px 16px" },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            borderRadius: "4px",
            "&:disabled": { background: "#4b5563", color: "#9ca3af" },
            "&:hover": { transform: "translateY(-1px)" },
          }}
        >
          Check
        </Button>
      </Box>
    </Box>
  );
};

export default GameControlsBar;
