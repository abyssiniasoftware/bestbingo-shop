import React from "react";
import { Box } from "@mui/material";

const getBallImage = (num) => `/balls/${num}.png`;

const RecentBallsStrip = ({ recentCalls = [] }) => {
    // Show only last 5
    const displayBalls = recentCalls.slice(0, 5);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "10px 20px",
                borderRadius: "50px",
                // Glassy Tube Effect
                background: "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "inset 0 0 15px rgba(0,0,0,0.8)", 
                height: "80px",
                minWidth: "350px",
            }}
        >
            {displayBalls.map((number, index) => (
                <Box
                    key={`${number}-${index}`}
                    component="img"
                    src={getBallImage(parseInt(number))}
                    alt={`Ball ${number}`}
                    sx={{
                        width: "60px",
                        height: "60px",
                        filter: "drop-shadow(0px 5px 5px rgba(0,0,0,0.5))",
                        animation: index === 0 ? "popIn 0.3s ease-out" : "none",
                    }}
                />
            ))}
        </Box>
    );
};

export default RecentBallsStrip;