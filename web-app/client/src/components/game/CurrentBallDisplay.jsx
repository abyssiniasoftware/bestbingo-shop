import React from "react";
import { Box, Typography } from "@mui/material";
import { balls } from "../../images/balls";

// Get ball image path from public folder
const getBallImage = (num) => balls[num];


const CurrentBallDisplay = ({ currentNumber, size = "large" }) => {
  const numValue = parseInt(currentNumber) || 0;
  const isValidNumber = numValue >= 1 && numValue <= 75;

  const sizeStyles = {
    large: {
      container: {
        width: { xs: 100, sm: 130, md: 150 },
        height: { xs: 100, sm: 130, md: 150 },
      },
      number: { fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" } },
    },
    medium: {
      container: {
        width: { xs: 80, sm: 100, md: 120 },
        height: { xs: 80, sm: 100, md: 120 },
      },
      number: { fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } },
    },
    small: {
      container: {
        width: { xs: 60, sm: 70, md: 80 },
        height: { xs: 60, sm: 70, md: 80 },
      },
      number: { fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } },
    },
  };

  const styles = sizeStyles[size] || sizeStyles.large;

  if (!isValidNumber) {
    return (
      <Box
        sx={{
          ...styles.container,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        }}
      >
        <Typography
          sx={{
            ...styles.number,
            fontWeight: "bold",
            color: "#9ca3af",
          }}
        >
          --
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className="current-number-display"
      sx={{
        ...styles.container,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 30% 30%, #ffd700 0%, #ffa500 50%, #ff8c00 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "0 0 30px rgba(255, 165, 0, 0.6), 0 10px 30px rgba(0, 0, 0, 0.3)",
        animation: "numberPulse 0.5s ease-out",
        position: "relative",
      }}
    >
      {/* Ball image overlay */}
      <Box
        component="img"
        src={getBallImage(numValue)}
        alt={`Ball ${numValue}`}
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: "50%",
        }}
      />

      {/* Large number text overlay */}
      <Typography
        sx={{
          ...styles.number,
          fontWeight: "bold",
          color: "white",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {numValue}
      </Typography>
    </Box>
  );
};

export default CurrentBallDisplay;
