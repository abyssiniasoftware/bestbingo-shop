import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import useWallet from "../../hooks/useWallet";
import config from "../../constants/config";

const blinkAnimation = `
  @keyframes blinker {
    50% { opacity: 0; }
  }
`;

const LowBalanceAlert = ({ onStatusChange }) => {
    const { wallet } = useWallet();
    const balance = wallet?.package ?? wallet?.packageBalance ?? wallet?.balance ?? 0;
    const isBalanceLow = balance < 10;

    useEffect(() => {
        if (onStatusChange) {
            onStatusChange(isBalanceLow);
        }
    }, [isBalanceLow, onStatusChange]);

    if (!isBalanceLow) return null;

    return (
        <Box
            sx={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                p: 1.5,
                mb: 2,
                textAlign: "center",
                animation: "blinker 1s linear infinite",
            }}
        >
            <style>{blinkAnimation}</style>
            <Typography
                sx={{
                    color: "#ef4444",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                }}
            >
                Your balance is low ({balance} ብር), please call to admin! 
            </Typography>
        </Box>
    );
};

export default LowBalanceAlert;
