import React from "react";
import { Box } from "@mui/material";

const getBallImage = (num) => `/balls/${num}.png`;

const RecentBallsStrip = ({ recentCalls = [] }) => {
  // Show last 5. Logic: recentCalls[0] is the newest.
  const displayBalls = recentCalls.slice(0, 5);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 20px",
        borderRadius: "50px",
        background: "rgba(0, 0, 0, 0.4)", // Darker, cleaner bar
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "inset 0 0 20px rgba(0,0,0,1)",
        height: "85px",
        minWidth: "380px",
        position: "relative",
        overflow: "hidden",
      }}
    >
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
          {/* Active Halo for the newest ball */}
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
                zIndex: 0,
              }}
            />
          )}

          <Box
            component="img"
            src={getBallImage(parseInt(number))}
            alt={`Ball ${number}`}
            sx={{
              width: index === 0 ? "68px" : "55px", // Newest is slightly larger
              height: index === 0 ? "68px" : "55px",
              filter:
                index === 0
                  ? "drop-shadow(0 0 10px rgba(0,255,255,0.7))"
                  : "brightness(1) grayscale(0)",
              zIndex: 1,
              transition: "all 0.5s ease",
            }}
          />
        </Box>
      ))}

      <style>
        {`
                @keyframes ballEntry {
                    0% { transform: scale(0) translateX(-100px); opacity: 0; }
                    100% { transform: scale(1) translateX(0); opacity: 1; }
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
