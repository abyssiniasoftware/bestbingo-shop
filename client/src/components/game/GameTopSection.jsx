import React from "react";
import { Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star"; // Ensure @mui/icons-material is installed
import BlowerAnimation from "./BlowerAnimation";
import RecentBallsStrip from "./RecentBallsStrip";
import PatternGrid from "./PatternGrid";
import "../../styles/game-redesign.css";
import BonusDisplay from "./BonusDisplay";

const GameTopSection = ({
  calledNumbers,
  currentNumber,
  recentCalls,
  callCount,
  blowerZoomBall,
  patternAnimationIndex,
  patterns,
  winAmount = 0,
}) => {
  // Current Pattern Logic
  const currentPattern = patterns?.[patternAnimationIndex] || {
    type: "None",
    progressGrid: Array(25).fill(false),
  };
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: { xs: "auto", lg: "280px" }, // Fixed height to match VLT screen
        background: "#050505",
        borderBottom: "6px solid #b91c1c", // Thick red bottom border from screenshot
        overflow: "hidden",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {/* --- SECTION 1: BLOWER & RECENT BALLS (Left - 45%) --- */}
      <Box
        sx={{
          flex: "0 0 45%",
          position: "relative",
          background: "linear-gradient(90deg, #0a0a0a 0%, #151525 100%)",
          display: "flex",
          alignItems: "center",
          borderRight: "4px solid #333",
          paddingLeft: "10px",
        }}
      >
        {/* Blower (Left) */}
        <Box
          sx={{
            width: "280px",
            height: "100%",
            position: "relative",
            zIndex: 2,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BlowerAnimation
            calledNumbers={calledNumbers}
            currentNumber={currentNumber}
            showCurrentBall={false}
            zoomingBallNum={blowerZoomBall}
          />
        </Box>

        {/* Info & Strip (Right of Blower) */}
        <Box
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center", // Center text and strip horizontally in this column
            paddingLeft: "10px",
            zIndex: 5,
          }}
        >
          {/* Header Text */}
          <Box sx={{ mb: 1, textAlign: "center" }}>
            <Typography
              sx={{
                color: "#fff",
                fontSize: "2.4rem",
                fontWeight: "900",
                lineHeight: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                letterSpacing: "1px",
              }}
            >
              Recent 5 Balls
            </Typography>
            <Typography
              sx={{
                color: "#00ffff", // Cyan
                fontSize: "1.8rem",
                fontWeight: "bold",
                mt: 0.5,
              }}
            >
              ጥሪ <span style={{ color: "#ffd700" }}>{callCount}</span>/75
            </Typography>
          </Box>

          {/* Ball Strip */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              mt: 1,
            }}
          >
            <RecentBallsStrip recentCalls={recentCalls} />
          </Box>
        </Box>
      </Box>

      {/* --- SECTION 2: PATTERN GRID (Middle - 20%) --- */}
      <Box
        sx={{
          flex: "0 0 20%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000",
          padding: "0 4px",
        }}
      >
        {/* BINGO Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            background: "#b91c1c",
            border: "1px solid #fff",
            borderBottom: "none",
          }}
        >
          {["B", "I", "N", "G", "O"].map((letter) => (
            <Box
              key={letter}
              sx={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "1.4rem",
                padding: "6px 0",
                textShadow: "0px 2px 4px rgba(0,0,0,0.6)",

                backgroundImage: "url(/images/num.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundColor: "transparent",
                cursor: "default",
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {letter}
            </Box>
          ))}
        </Box>

        {/* Clean Pattern Grid */}
        <PatternGrid progressGrid={currentPattern.progressGrid} />
      </Box>

      {/* --- SECTION 3: PRIZE & DERASH (Right - 35%) --- */}
      <Box
        sx={{
          flex: "1",
          display: "flex",
          borderLeft: "2px solid #333",
        }}
      >
        {/* 3A. Prize List Box */}
        <Box
          sx={{
            width: "35%",
            background: "#222",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <BonusDisplay />
        </Box>

        {/* 3B. Derash (Jackpot) Panel */}
        <Box
          sx={{
            flex: 1,
            background: "#2a0a0a", // Dark red/black
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: "1px solid #444",
          }}
        >
          <Box
            component="img"
            src="/images/derash.png"
            alt="Derash"
            sx={{ maxWidth: "100%", height: "auto" }}
          />
          <Typography
            sx={{
              color: "#fff",
              fontSize: "5rem",
              fontWeight: "500",
              lineHeight: 1,
              mt: 1,
            }}
          >
            {Number(winAmount).toFixed(0)}
          </Typography>
          <Typography
            sx={{
              color: "#fff",
              fontSize: "2.5rem",
              fontWeight: "bold",
              lineHeight: 1,
            }}
          >
            ብር
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GameTopSection;
