import React from "react";
import { Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { called } from "../../images/images";

const numbers = [
  6,
  16,
  39,
  55,
  69,
  5,
  17,
  34,
  49,
  59,
  13,
  27,
  "★",
  53,
  73,
  14,
  30,
  32,
  57,
  68,
  1,
  24,
  41,
  58,
  61,
];

const PatternGrid = ({ progressGrid }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
        height: "100%",
        boxSizing: "border-box",
        gap: "2px",
        padding: "3px",
        background: "#fff",
        border: "2px solid #ff0000",
      }}
    >
      {numbers.map((value, idx) => {
        const isCenter = idx === 12;
        const isActive = progressGrid[idx];

        return (
          <Box
            key={idx}
            sx={{
              position: "relative",
              borderRadius: "10px",
              background: isCenter ? "#f59e0b" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 0 0 1px #e5e5e5",
            }}
          >
            {/* Number */}
            {!isCenter && (
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#b91c1c",
                  zIndex: 1,
                }}
              >
                {value}
              </Typography>
            )}

            {/* Center Star */}
            {isCenter && (
              <StarIcon
                sx={{
                  color: "#7c2d12",
                  fontSize: "1.8rem",
                  backgroundImage: `url(${called})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundColor: "transparent",
                  cursor: "default",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              />
            )}

            {/* SOLID RED BINGO BALL */}
            {isActive && !isCenter && (
              <Box
                sx={{
                  position: "absolute",
                  width: "75%",
                  height: "75%",
                  borderRadius: "50%",
                  background: `
                    radial-gradient(
                      circle at 30% 30%,
                      #ffb3b3 0%,
                      #ff2b2b 35%,
                      #c40000 70%,
                      #8b0000 100%
                    )
                  `,
                  boxShadow: `
                    inset -3px -6px 8px rgba(0,0,0,0.4),
                    0 4px 6px rgba(0,0,0,0.5)
                  `,
                }}
              >
                {/* Highlight */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "18%",
                    left: "22%",
                    width: "20%",
                    height: "20%",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.8)",
                  }}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default PatternGrid;
