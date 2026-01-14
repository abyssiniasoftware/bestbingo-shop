import React from "react";
import { Box, Typography } from "@mui/material";
import "../../styles/game-redesign.css";

const PrizeTierDisplay = ({
    winAmount,
    prizeTiers = [
        { calls: 4, amount: 2000 },
        { calls: 5, amount: 200 },
    ],
    showDerash = true,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
            }}
        >
            {/* "አንድ ዝግ" label */}
            <Typography
                sx={{
                    color: "#dc2626",
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
            >
                አንድ ዝግ
            </Typography>

            {/* Prize tier table */}
            <Box
                className="prize-tier-box"
                sx={{
                    background: "#1a1a1a",
                    border: "2px solid #fbbf24",
                    borderRadius: "8px",
                    padding: "10px",
                    minWidth: { xs: 120, sm: 150 },
                }}
            >
                {/* Header */}
                <Box
                    className="prize-tier-header"
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4px",
                        paddingBottom: "8px",
                        borderBottom: "1px solid #fbbf24",
                        color: "#fbbf24",
                        fontWeight: "bold",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                >
                    <Typography sx={{ textAlign: "center", color: "inherit", fontSize: "inherit" }}>
                        ጥሪ
                    </Typography>
                    <Typography sx={{ textAlign: "center", color: "inherit", fontSize: "inherit" }}>
                        ሽልማት
                    </Typography>
                </Box>

                {/* Rows */}
                {prizeTiers.map((tier, index) => (
                    <Box
                        key={index}
                        className="prize-tier-row"
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "4px",
                            padding: "6px 0",
                            color: "white",
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                    >
                        <Typography sx={{ textAlign: "center", color: "inherit", fontSize: "inherit" }}>
                            {tier.calls}
                        </Typography>
                        <Typography sx={{ textAlign: "center", color: "inherit", fontSize: "inherit" }}>
                            {tier.amount}
                            <br />
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>ብር</span>
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Derash (Winner Prize) display */}
            {showDerash && (
                <Box
                    sx={{
                        background: "#1a1a1a",
                        border: "2px solid #fbbf24",
                        borderRadius: "8px",
                        padding: "15px 20px",
                        textAlign: "center",
                    }}
                >
                    <Typography
                        sx={{
                            color: "#dc2626",
                            fontWeight: "bold",
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                    >
                        ደራሽ
                    </Typography>
                    <Typography
                        sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
                        }}
                    >
                        {Math.floor(winAmount || 0)}
                    </Typography>
                    <Typography
                        sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                    >
                        ብር
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default PrizeTierDisplay;
