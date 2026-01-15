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
        gap: "15px",
        padding: "5px 15px",
        borderRadius: "15px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.2) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.1)",
        height: "80px",
        minWidth: "420px",
        position: "relative",
        overflow: "visible",
        backdropFilter: "blur(10px)",
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
              width: "62px",
              height: "62px",
              filter:
                index === 0
                  ? "drop-shadow(0 0 15px rgba(255,255,255,0.8))"
                  : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              zIndex: 1,
              transition: "all 0.5s ease",
              transform: index === 0 ? "scale(1.1)" : "scale(1)",
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
