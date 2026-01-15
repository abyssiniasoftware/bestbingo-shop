import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import "../../styles/game-redesign.css";

// Get ball image path from public folder
const getBallImage = (num) => `/balls/${num}.png`;

// Generate positions once during initial render
const generateBallPositions = (calledNumbers) => {
  const positions = [];
  const calledSet = new Set(calledNumbers.map((n) => parseInt(n)));

  // Increase count to make it look full (approx 70 balls)
  for (let i = 1; i <= 75; i++) {
    if (!calledSet.has(i)) {
      // Create more chaotic, packed positions
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 60; // Concentrated but spread
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Randomize animation timings for chaos
      const delay = Math.random() * 2;
      const duration = 1.0 + Math.random() * 1.5;
      const driftX = (Math.random() - 0.5) * 30;
      const driftY = (Math.random() - 0.5) * 30;

      positions.push({
        num: i,
        x,
        y,
        delay,
        duration,
        driftX,
        driftY
      });
    }
  }
  return positions;
};

const BlowerAnimation = ({
  calledNumbers = [],
  currentNumber,
  showCurrentBall = true,
  zoomingBallNum = null
}) => {
  // Store positions in state to avoid recalculating on every render
  const [ballPositions, setBallPositions] = useState([]);

  useEffect(() => {
    setBallPositions(generateBallPositions(calledNumbers));
  }, [calledNumbers]);

  return (
    <Box className="blower-container">
      {/* Blower sphere container */}
      <Box
        sx={{
          position: "relative",
          width: { xs: 150, sm: 180, md: 500 },
          height: { xs: 150, sm: 180, md: 550 },
        }}
      >
        <Box
          component="img"
          src="/images/blower.png"
          alt="Bingo Blower"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            transform: "rotate(90deg)",
            transformOrigin: "center",
          }}
        />

        {/* Balls container inside the blower */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          {ballPositions.map((ball) => (
            <Box
              key={ball.num}
              component="img"
              src={getBallImage(ball.num)}
              alt={`Ball ${ball.num}`}
              sx={{
                position: "absolute",
                width: { xs: 15, sm: 18, md: 22 }, // Slightly smaller to fit more
                height: { xs: 15, sm: 18, md: 22 },
                borderRadius: "50%",
                left: `calc(50% + ${ball.x}px)`,
                top: `calc(50% + ${ball.y}px)`,
                transform: "translate(-50%, -50%)",
                animation: `ballChaos ${ball.duration}s ease-in-out ${ball.delay}s infinite alternate`,
                opacity: 0.9,
                "--drift-x": `${ball.driftX}px`, // Custom properties for animation
                "--drift-y": `${ball.driftY}px`,
              }}
            />
          ))}

          {/* THE ZOOMING BALL EFFECT */}
          {zoomingBallNum && (
            <Box
              component="img"
              src={getBallImage(parseInt(zoomingBallNum))}
              alt={`Zooming Ball ${zoomingBallNum}`}
              sx={{
                position: "absolute",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                left: "50%",
                top: "50%",
                zIndex: 100,
                transform: "translate(-50%, -50%)",
                animation: "zoomAndVanish 1s ease-out forwards",
              }}
            />
          )}
        </Box>

        {/* Current called ball - small corner preview if enabled */}
        {showCurrentBall && currentNumber && currentNumber !== "00" && (
          <Box
            sx={{
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <Box
              component="img"
              src={getBallImage(parseInt(currentNumber))}
              alt={`Current: ${currentNumber}`}
              sx={{
                width: { xs: 50, sm: 60, md: 70 },
                height: { xs: 50, sm: 60, md: 70 },
                borderRadius: "50%",
                boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
                animation: "numberPulse 0.5s ease-out",
              }}
            />
          </Box>
        )}

        <style>
          {`
            @keyframes ballChaos {
                0% { transform: translate(-50%, -50%) translate(0, 0); }
                33% { transform: translate(-50%, -50%) translate(var(--drift-x), var(--drift-y)); }
                66% { transform: translate(-50%, -50%) translate(calc(var(--drift-x) * -0.5), calc(var(--drift-y) * 1.2)); }
                100% { transform: translate(-50%, -50%) translate(calc(var(--drift-x) * 0.8), calc(var(--drift-y) * -0.6)); }
            }
            @keyframes zoomAndVanish {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; filter: brightness(1); }
                50% { transform: translate(-50%, -50%) scale(2.5); opacity: 1; filter: brightness(1.5); }
                100% { transform: translate(-50%, -50%) scale(5); opacity: 0; filter: brightness(2); }
            }
          `}
        </style>
      </Box>
    </Box>
  );
};

export default BlowerAnimation;
