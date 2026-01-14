import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import "../../styles/game-redesign.css";

// Get ball image path from public folder
const getBallImage = (num) => `/balls/${num}.png`;

// Generate positions once during initial render
const generateBallPositions = (calledNumbers) => {
  const positions = [];
  const calledSet = new Set(calledNumbers.map((n) => parseInt(n)));

  for (let i = 1; i <= 75; i++) {
    if (!calledSet.has(i)) {
      // Use deterministic position based on ball number
      const angle = (i / 75) * Math.PI * 2;
      const radiusOffset = (i % 3) * 15;
      const radius = 20 + radiusOffset;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const delay = (i % 5) * 0.4;
      const duration = 1.5 + (i % 3) * 0.5;

      positions.push({
        num: i,
        x,
        y,
        delay,
        duration,
      });
    }
  }
  return positions;
};

const BlowerAnimation = ({
  calledNumbers = [],
  currentNumber,
  showCurrentBall = true,
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
          width: { xs: 150, sm: 180, md: 250 },
          height: { xs: 150, sm: 180, md: 250 },
        }}
      >
        {/* Main blower image 
                reason for rotate the image is due tube is to be horizontal the image had tube
                */}
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
          {ballPositions.slice(0, 25).map((ball) => (
            <Box
              key={ball.num}
              component="img"
              src={getBallImage(ball.num)}
              alt={`Ball ${ball.num}`}
              sx={{
                position: "absolute",
                width: { xs: 18, sm: 22, md: 25 },
                height: { xs: 18, sm: 22, md: 25 },
                borderRadius: "50%",
                left: `calc(50% + ${ball.x}px)`,
                top: `calc(50% + ${ball.y}px)`,
                transform: "translate(-50%, -50%)",
                animation: `ballBounce ${ball.duration}s ease-in-out ${ball.delay}s infinite`,
              }}
            />
          ))}
        </Box>

        {/* Current called ball - large display on top */}
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
      </Box>
    </Box>
  );
};

export default BlowerAnimation;
