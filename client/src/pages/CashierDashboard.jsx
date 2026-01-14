import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { FaSignOutAlt, FaGamepad, FaIdCard, FaChartBar } from "react-icons/fa";

import NewGame from "./NewGame";
import ViewCartela from "./ViewCartela";
import Reports from "./Reports";

import useWallet from "../hooks/useWallet";
import useUserStore from "../stores/userStore";
import "../styles/game-redesign.css";

const CashierDashboard = () => {
  const [activeTab, setActiveTab] = useState("game-board");
  const [showModal, setShowModal] = useState(true);
  const { wallet, isLoading: walletLoading, refreshWallet } = useWallet();
  const { username, clearUser } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Check for navigation state to set active tab
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      setShowModal(false);
    }
  }, [location.state]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("houseId");
    localStorage.removeItem("tokenExpiration");
    clearUser();
    navigate("/login");
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setShowModal(false);
  };

  const handleStartGame = () => {
    setShowModal(false);
    setActiveTab("game-board");
  };

  // Check if there's any reservation (for start button activation)
  const hasReservation = true; // This should be dynamic based on actual reservation status

  const renderTabContent = () => {
    switch (activeTab) {
      case "game-board":
        return <NewGame />;
      case "bingo-cards":
        return <ViewCartela />;
      case "reports":
        return <Reports />;
      default:
        return <NewGame />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#111827",
        position: "relative",
      }}
    >
      {/* Main Content - Always visible behind modal */}
      <Box
        sx={{
          filter: showModal ? "blur(2px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        {/* Header bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            background: "#1f2937",
            borderBottom: "2px solid #374151",
          }}
        >
          {/* Navigation tabs */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => handleNavigate("game-board")}
              startIcon={<FaGamepad />}
              sx={{
                color: activeTab === "game-board" ? "#fbbf24" : "#9ca3af",
                borderBottom:
                  activeTab === "game-board" ? "2px solid #fbbf24" : "none",
                borderRadius: 0,
                px: 2,
                "&:hover": { color: "#fbbf24" },
              }}
            >
              Game Board
            </Button>
            <Button
              onClick={() => handleNavigate("bingo-cards")}
              startIcon={<FaIdCard />}
              sx={{
                color: activeTab === "bingo-cards" ? "#fbbf24" : "#9ca3af",
                borderBottom:
                  activeTab === "bingo-cards" ? "2px solid #fbbf24" : "none",
                borderRadius: 0,
                px: 2,
                "&:hover": { color: "#fbbf24" },
              }}
            >
              Cards
            </Button>
            <Button
              onClick={() => handleNavigate("reports")}
              startIcon={<FaChartBar />}
              sx={{
                color: activeTab === "reports" ? "#fbbf24" : "#9ca3af",
                borderBottom:
                  activeTab === "reports" ? "2px solid #fbbf24" : "none",
                borderRadius: 0,
                px: 2,
                "&:hover": { color: "#fbbf24" },
              }}
            >
              Reports
            </Button>
          </Box>

          {/* User info and wallet */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ color: "#9ca3af" }}>
              {username || "Cashier"}
            </Typography>
            <Box
              sx={{
                background: "#374151",
                px: 2,
                py: 1,
                borderRadius: "20px",
              }}
            >
              <Typography sx={{ color: "#fbbf24", fontWeight: "bold" }}>
                {walletLoading ? "..." : `${wallet?.balance || 0} ብር`}
              </Typography>
            </Box>
            <Button
              onClick={handleLogout}
              startIcon={<FaSignOutAlt />}
              sx={{
                color: "#ef4444",
                "&:hover": { background: "rgba(239,68,68,0.1)" },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Tab content */}
        <Box>{renderTabContent()}</Box>
      </Box>

      {/* Modal Overlay - Shows on initial load */}
      {showModal && (
        <Box
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
            {/* Modal Header with navigation buttons */}
            <Box
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
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    "&:hover": { background: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Logout
                </Button>
                <Button
                  onClick={() => handleNavigate("game-board")}
                  sx={{
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    "&:hover": { background: "rgba(255,255,255,0.1)" },
                  }}
                >
                  /Register
                </Button>
                <Button
                  onClick={() => handleNavigate("bingo-cards")}
                  sx={{
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    "&:hover": { background: "rgba(255,255,255,0.1)" },
                  }}
                >
                  /Card
                </Button>
                <Button
                  onClick={() => handleNavigate("reports")}
                  sx={{
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    "&:hover": { background: "rgba(255,255,255,0.1)" },
                  }}
                >
                  /Report
                </Button>
              </Box>
              <Typography sx={{ fontSize: "0.875rem" }}>Round 1</Typography>
            </Box>

            {/* Modal Body with BINGO card preview */}
            <Box sx={{ padding: "20px", textAlign: "center" }}>
              {/* Welcome message */}
              <Typography
                sx={{
                  mb: 2,
                  color: "#333",
                  fontWeight: "bold",
                  fontSize: "1.25rem",
                }}
              >
                እንኳን ደህና መጡ!
              </Typography>

              <Typography sx={{ mb: 3, color: "#666" }}>
                {hasReservation
                  ? "ጨዋታ ለመጀመር ዝግጁ ነዎት። Start ይጫኑ"
                  : "ካርድ ይምረጡና ጨዋታ ይጀምሩ"}
              </Typography>

              {/* Sample BINGO Card Preview */}
              <Box
                sx={{
                  margin: "20px auto",
                  border: "3px solid #fbbf24",
                  borderRadius: "8px",
                  overflow: "hidden",
                  maxWidth: "300px",
                }}
              >
                {/* BINGO header */}
                <Box sx={{ display: "flex", background: "#fbbf24" }}>
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

                {/* Card body - sample numbers */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                  }}
                >
                  {[
                    [12, 16, 33, 56, 61],
                    [1, 26, 44, 55, 71],
                    [3, 23, "FREE", 46, 72],
                    [5, 17, 37, 49, 74],
                    [15, 28, 42, 60, 75],
                  ]
                    .flat()
                    .map((num, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          padding: "10px",
                          border: "1px solid #e5e7eb",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          background: num === "FREE" ? "#fef3c7" : "#fffef7",
                          color: num === "FREE" ? "#92400e" : "#333",
                        }}
                      >
                        {num}
                      </Box>
                    ))}
                </Box>
              </Box>

              {/* Start Button */}
              <Button
                onClick={handleStartGame}
                fullWidth
                sx={{
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
      )}
    </Box>
  );
};

export default CashierDashboard;
