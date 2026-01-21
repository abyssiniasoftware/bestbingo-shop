import React from "react";
import { Box } from "@mui/material";

const getBallImage = (num) => `/balls/${num}.png`;

const RecentBallsStrip = ({ recentCalls = [] }) => {
  const displayBalls = recentCalls.slice(0, 5);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "0 15px",
        height: "80px",
        width: "100%",
        position: "relative",
        overflow: "visible",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow:
          "inset 0 4px 15px rgba(255,255,255,0.2), 0 8px 25px rgba(0,0,0,0.5)",
        backdropFilter: "blur(15px)",
        borderRadius: "10px 50px 50px 10px", // left/right ends
        perspective: "1000px",
      }}
    >
      {/* Inner 3D curved gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "10px 50px 50px 10px",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
          transform: "rotateX(8deg)",
          zIndex: 0,
        }}
      />

      {displayBalls.map((number, index) => (
        <Box
          key={`${number}-${recentCalls.length - index}`}
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation:
              index === 0
                ? "ballEntry 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                : "none",
            transition: "all 0.5s ease",
          }}
        >
          {/* Halo for newest ball */}
          {index === 0 && (
            <Box
              sx={{
                position: "absolute",
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,255,255,0.4) 0%, transparent 70%)",
                animation: "haloPulse 1s infinite alternate",
                zIndex: 1,
              }}
            />
          )}

          <Box
            component="img"
            src={getBallImage(parseInt(number))}
            alt={`Ball ${number}`}
            sx={{
              width: "62px",
              height: "62px",
              filter:
                index === 0
                  ? "drop-shadow(0 0 15px rgba(255,255,255,0.8))"
                  : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              zIndex: 2,
              transition: "all 0.5s ease",
              transform: index === 0 ? "scale(1.1) translateZ(10px)" : "scale(1)",
            }}
          />
        </Box>
      ))}

      <style>
        {`
          @keyframes ballEntry {
            0% { transform: scale(0) translateX(-100px) translateZ(-20px); opacity: 0; }
            100% { transform: scale(1) translateX(0) translateZ(0); opacity: 1; }
          }
          @keyframes haloPulse {
            from { transform: scale(0.9); opacity: 0.3; }
            to { transform: scale(1.1); opacity: 0.6; }
          }
        `}
      </style>
    </Box>
  );
};

export default RecentBallsStrip;
