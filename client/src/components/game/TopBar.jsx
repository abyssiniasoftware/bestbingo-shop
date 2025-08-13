import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Slider,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  FaPlay,
  FaPause,
  FaRandom,
  FaShapes,
  FaAddressCard,
} from "react-icons/fa";
import { BINGO_PATTERNS, META_PATTERNS } from "../../utils/patterns";
import { formatPatternName } from "../../utils/gameUtils";

const TopBar = ({
  isPlaying,
  isShuffling,
  isReady,
  isGameEnded,
  togglePlayPause,
  handleShuffleClick,
  handlePatternSelectOpen,
  patternAnchorEl,
  handlePatternSelectClose,
  voiceOptions,
  voiceOption,
  handleVoiceChange,
  drawSpeed,
  setDrawSpeed,
  cardIdInput,
  setCardIdInput,
  checkWinner,
  // handleReady,
  // handleReset,
  // stake,
  // players,
  // winAmount,
  backgroundOptions,
  selectedBackground,
  handleBackgroundChange,
  primaryPattern,
  setPrimaryPattern,
  secondaryPattern,
  setSecondaryPattern,
  patternLogic,
  setPatternLogic,
  handleBack,
  hasGameStarted,
}) => {
  const commonPatterns = [
    "row",
    "column",
    "diagonal",
    "oneLine",
    "fourCorners",
    "innerCorners",
    "innerOrfourCorners",
    "allSingleMiddleCorner",
    "anyTwoHorizontalLine",
    "anyTwoVerticalLine",
    "anyTwoLine",
    "anyThreeLine",
    "anyFourLine",
    "anyFiveLine",
    "anySixLine",
    "anySevenLine",

    ...Object.keys(META_PATTERNS),
    "plus",
    "xPattern",
    "lPattern",
    "reverseL",
    "tPattern",
    "reverseT",
    "uPattern",
    "cross",
    "diamond",
    "postageStamp",
    "bigDiamond",
    "blackout",
  ];
  const allPatterns = [
    ...commonPatterns,
    ...Object.keys(BINGO_PATTERNS).filter((p) => !commonPatterns.includes(p)),
  ];

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && cardIdInput && !isPlaying) {
      checkWinner();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 0.5,
        flexWrap: "wrap",
        gap: { xs: 1, sm: 0.5 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 2, md: 4 },
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          onClick={handleBack}
          disabled={hasGameStarted && !isGameEnded}
          sx={{
            bgcolor: "#60a5fa",
            "&:hover": { bgcolor: "#F63B64FF" },
            color: "#fff",
            p: 0.5,
            "&.Mui-disabled": { bgcolor: "#a9a9a9", color: "#0a0a0a" },
          }}
        >
          ተጫዋች ጨምር
        </Button>

        <IconButton
          onClick={togglePlayPause}
          sx={{
            bgcolor: isPlaying ? "#ef4444" : "#60a5fa",
            "&:hover": { bgcolor: isPlaying ? "#dc2626" : "#3b82f6" },
            color: "#fff",
            p: 0.5,
          }}
        >
          {isPlaying ? "አቁም" : "ጀምር"}
        </IconButton>
        <IconButton
          onClick={handleShuffleClick}
          disabled={isPlaying || isReady}
          sx={{
            bgcolor: isShuffling ? "#f59e0b" : "#60a5fa",
            "&:hover": { bgcolor: isShuffling ? "#d97706" : "#3b82f6" },
            color: "#fff",
            p: 0.5,
          }}
        >
          በዉዝ
        </IconButton>
        <IconButton
          onClick={handlePatternSelectOpen}
          sx={{
            bgcolor: "#60a5fa",
            "&:hover": { bgcolor: "#3b82f6" },
            color: "#fff",
          }}
        >
          ፓተርን
        </IconButton>
        <Menu
          anchorEl={patternAnchorEl}
          open={Boolean(patternAnchorEl)}
          onClose={handlePatternSelectClose}
          PaperProps={{
            sx: {
              bgcolor: "#1f2937",
              color: "#fff",
              padding: 0,
              borderRadius: "8px",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 1 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: "#fff" }}>ዋና ፓተርን</InputLabel>
              <Select
                value={primaryPattern || ""}
                onChange={(e) => setPrimaryPattern(e.target.value)}
                sx={{
                  bgcolor: "#4b5563",
                  color: "#fff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                <MenuItem value="">
                  <em>አልባ</em>
                </MenuItem>
                {allPatterns.map((pattern) => (
                  <MenuItem key={`primary-${pattern}`} value={pattern}>
                    {formatPatternName(pattern)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: "#fff" }}>እና/ወይም</InputLabel>
              <Select
                value={patternLogic || "AND"}
                onChange={(e) => setPatternLogic(e.target.value)}
                sx={{
                  bgcolor: "#4b5563",
                  color: "#fff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                <MenuItem value="OR">ወይም</MenuItem>
                <MenuItem value="AND">እና</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: "#fff" }}>ሁለተኛ ፓተርን</InputLabel>
              <Select
                value={secondaryPattern || ""}
                onChange={(e) => setSecondaryPattern(e.target.value)}
                sx={{
                  bgcolor: "#4b5563",
                  color: "#fff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                <MenuItem value="">
                  <em>አልባ</em>
                </MenuItem>
                {allPatterns.map((pattern) => (
                  <MenuItem key={`secondary-${pattern}`} value={pattern}>
                    {formatPatternName(pattern)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Menu>
        <select
          value={
            voiceOptions.find((option) => option.value === voiceOption)
              ?.label || ""
          }
          onChange={handleVoiceChange}
          style={{
            backgroundColor: "#4b5563",
            color: "#fff",
            borderRadius: "8px",
            padding: "5px",
            marginRight: { xs: "5px", sm: "10px" },
          }}
        >
          {voiceOptions.map((option) => (
            <option key={option.value} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
        <Box
          sx={{ width: { xs: 100, sm: 120, md: 150 }, mx: { xs: 1, sm: 2 } }}
        >
          <Typography
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
          >
            የድምፅ ፍጥነት
          </Typography>
          <Slider
            value={drawSpeed}
            onChange={(e, newValue) => setDrawSpeed(newValue)}
            min={2000}
            max={7500}
            step={500}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value / 1000}s`}
            sx={{ color: "#60a5fa" }}
          />
        </Box>
        <FormControl sx={{ minWidth: { xs: 100, sm: 120 } }}>
          <InputLabel
            sx={{
              color: "#fff",
              fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
            }}
          >
            ጀርባ
          </InputLabel>
          <Select
            value={selectedBackground}
            onChange={handleBackgroundChange}
            sx={{
              bgcolor: "#4b5563",
              color: "#fff",
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            }}
          >
            {backgroundOptions.map((bg) => (
              <MenuItem key={bg.value} value={bg.value}>
                {bg.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {!isPlaying && (
          <>
            <TextField
              label="የካርድ መታወቂያ ያስገቡ"
              value={cardIdInput}
              onChange={(e) => setCardIdInput(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              sx={{
                bgcolor: "#4b5563",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { border: "none" },
                },
                "& .MuiInputLabel-root": {
                  color: "#fff",
                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                },
                width: { xs: 100, sm: 120, md: 130 },
              }}
            />
            <Button
              variant="contained"
              onClick={checkWinner}
              disabled={!cardIdInput}
              sx={{
                bgcolor: "#60a5fa",
                color: "#fff",
                "&:hover": { bgcolor: "#3b82f6" },
                borderRadius: "8px",
                textTransform: "none",
                "&.Mui-disabled": { bgcolor: "#a9a9a9", color: "#0a0a0a" },
              }}
            >
              አሸናፊ ይፈትሹ
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TopBar;
