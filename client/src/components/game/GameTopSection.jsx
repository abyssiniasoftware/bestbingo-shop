import React from "react";
import { Box, Typography } from "@mui/material";
import BlowerAnimation from "./BlowerAnimation";
import RecentBallsStrip from "./RecentBallsStrip";
import PatternGrid from "./PatternGrid";
import BonusDisplay from "./BonusDisplay";
import "../../styles/game-redesign.css";

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
  const currentPattern = patterns?.[patternAnimationIndex] || {
    type: "None",
    progressGrid: Array(25).fill(false),
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: { xs: "auto", lg: "280px" },
        background: "#050505",
        borderBottom: "6px solid #b91c1c",
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
          overflow: "visible",
        }}
      >
        {/* Blower Container */}
        <Box
          sx={{
            width: "300px",
            height: "100%",
            position: "relative",
            zIndex: 10,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          <BlowerAnimation
            calledNumbers={calledNumbers}
            currentNumber={currentNumber}
            showCurrentBall={false}
            zoomingBallNum={blowerZoomBall}
          />
        </Box>

        {/* Right Side of Section 1: Text + The Tube */}
        <Box
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Centers the group vertically
            marginLeft: "-65px", // Pulls closer to blower
            zIndex: 5,
            position: "relative",
          }}
        >
          {/* Header Text - Positioned slightly above the tube */}
          <Box
            sx={{
              position: "absolute",
              top: "4px",
              left: "70px",
              textAlign: "left",
              zIndex: 10
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontSize: "2.2rem",
                fontWeight: "900",
                lineHeight: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                letterSpacing: "1px",
              }}
            >
              Recent 5 Balls
            </Typography>
            <Typography
              sx={{
                color: "#00ffff",
                fontSize: "1.4rem",
                fontWeight: "bold",
                mt: 0.5,
              }}
            >
              ጥሪ <span style={{ color: "#ffd700" }}>{callCount}</span>/75
            </Typography>
          </Box>

          {/* THE TUBE CONTAINER */}
          {/* This creates the visual glass pipe effect */}
          <Box
            sx={{
              width: "100%",
              height: "85px", // Fixed height for the tube
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",

              // TUBE STYLING -------------------------
              background: "linear-gradient(180deg, rgba(20,20,20,0.6) 0%, rgba(60,60,60,0.4) 50%, rgba(20,20,20,0.6) 100%)",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              borderRight: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "0 50px 50px 0", // Rounded end on the right only
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)", // Inner shadow for depth
              backdropFilter: "blur(4px)",
              // --------------------------------------

              paddingLeft: "70px", // Internal padding so balls don't hit the blower edge
              position: "relative",
              zIndex: 4, // Behind the blower
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
        <Box
          sx={{
            flex: 1,
            background: "#2a0a0a",
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