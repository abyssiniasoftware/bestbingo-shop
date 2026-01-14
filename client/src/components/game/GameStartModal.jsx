import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../../styles/game-redesign.css";

const GameStartModal = ({
  isOpen,
  onStart,
  hasReservation,
  cartelaData,
  roundNumber = 1,
  onLogout,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("houseId");
    localStorage.removeItem("tokenExpiration");
    if (onLogout) onLogout();
    navigate("/login");
  };

  const handleRegisterCard = () => {
    navigate("/dashboard", { state: { activeTab: "bingo-cards" } });
  };

  const handleReport = () => {
    navigate("/dashboard", { state: { activeTab: "reports" } });
  };

  // Generate a sample BINGO card for preview
  const bingoNumbers = cartelaData || {
    B: [12, 1, 3, 5, 15],
    I: [16, 26, 23, 17, 28],
    N: [33, 44, "free", 37, 42],
    G: [56, 55, 46, 49, 60],
    O: [61, 71, 72, 74, 75],
  };

  return (
    <Box
      className="game-modal-overlay"
      sx={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
      }}
    >
      <Box
        className="game-modal-content"
        sx={{
          background: "#fff",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header with navigation buttons */}
        <Box
          className="game-modal-header"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: "#333",
            color: "white",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={handleLogout}
              sx={{
                color: "white",
                borderColor: "white",
                fontSize: "0.75rem",
                padding: "4px 8px",
                "&:hover": { background: "rgba(255,255,255,0.1)" },
              }}
              variant="text"
            >
              Logout
            </Button>
            <Button
              onClick={handleRegisterCard}
              sx={{
                color: "white",
                borderColor: "white",
                fontSize: "0.75rem",
                padding: "4px 8px",
                "&:hover": { background: "rgba(255,255,255,0.1)" },
              }}
              variant="text"
            >
              /Register Card
            </Button>
            <Button
              onClick={handleReport}
              sx={{
                color: "white",
                borderColor: "white",
                fontSize: "0.75rem",
                padding: "4px 8px",
                "&:hover": { background: "rgba(255,255,255,0.1)" },
              }}
              variant="text"
            >
              /Report
            </Button>
          </Box>
          <Typography sx={{ fontSize: "0.875rem" }}>
            Round {roundNumber}
          </Typography>
        </Box>

        {/* Body with BINGO card preview */}
        <Box
          className="game-modal-body"
          sx={{ padding: "20px", textAlign: "center" }}
        >
          {/* Message */}
          <Typography sx={{ mb: 2, color: "#333" }}>
            {hasReservation
              ? `የተጫዋች ቁሳት ከ ${Object.keys(bingoNumbers).length > 0 ? 12 : 0} ባላይ ካሆነ ጎላስ መስጠት ይድምሰል!`
              : "ምንም ቦታ ተያዥ የለም። እባክዎ ካርዶች ይምረጡ።"}
          </Typography>

          {/* BINGO Card Preview */}
          <Box
            className="bingo-card-preview"
            sx={{
              margin: "20px auto",
              border: "3px solid #fbbf24",
              borderRadius: "8px",
              overflow: "hidden",
              maxWidth: "300px",
            }}
          >
            {/* BINGO header */}
            <Box
              className="bingo-card-header"
              sx={{
                display: "flex",
                background: "#fbbf24",
              }}
            >
              {["B", "I", "N", "G", "O"].map((letter) => (
                <Box
                  key={letter}
                  sx={{
                    flex: 1,
                    padding: "8px",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#dc2626",
                    textAlign: "center",
                  }}
                >
                  {letter}
                </Box>
              ))}
            </Box>

            {/* Card body */}
            <Box
              className="bingo-card-body"
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
              }}
            >
              {[0, 1, 2, 3, 4].map((row) =>
                ["B", "I", "N", "G", "O"].map((col) => {
                  const value = bingoNumbers[col]?.[row];
                  const isFree = value === "free" || (col === "N" && row === 2);
                  return (
                    <Box
                      key={`${col}-${row}`}
                      className={`bingo-card-cell ${isFree ? "free" : ""}`}
                      sx={{
                        padding: "10px",
                        border: "1px solid #e5e7eb",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        background: isFree ? "#fef3c7" : "#fffef7",
                        color: isFree ? "#92400e" : "#333",
                      }}
                    >
                      {isFree ? "free" : value || "--"}
                    </Box>
                  );
                }),
              )}
            </Box>
          </Box>

          {/* Start Button */}
          <Button
            className="start-button"
            onClick={onStart}
            disabled={!hasReservation}
            sx={{
              width: "100%",
              padding: "16px",
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "white",
              background: hasReservation
                ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                : "#9ca3af",
              border: "none",
              borderRadius: "8px",
              cursor: hasReservation ? "pointer" : "not-allowed",
              transition: "all 0.3s",
              "&:hover": hasReservation
                ? {
                    transform: "translateY(-2px)",
                    boxShadow: "0 5px 20px rgba(37, 99, 235, 0.4)",
                  }
                : {},
            }}
          >
            Start
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GameStartModal;
