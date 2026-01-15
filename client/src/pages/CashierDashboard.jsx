import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { FaSignOutAlt, FaGamepad, FaIdCard, FaChartBar, FaEye, FaEyeSlash } from "react-icons/fa";

import NewGame from "./NewGame";
import ViewCartela from "./ViewCartela";
import Reports from "./Reports";

import useWallet from "../hooks/useWallet";
import useUserStore from "../stores/userStore";
import "../styles/game-redesign.css";

const CashierDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => location.state?.activeTab || "game-board");
  const { wallet, isLoading: walletLoading } = useWallet();
  const { username, clearUser } = useUserStore();
  const [showBalance, setShowBalance] = useState(
    () => JSON.parse(localStorage.getItem("showBalance")) ?? false,
  );

  useEffect(() => {
    localStorage.setItem("showBalance", JSON.stringify(showBalance));
  }, [showBalance]);


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
  };

  const handleStartGame = () => {
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
        background: "#f6f6f6",
        position: "relative",
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
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
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Typography sx={{ color: "#fbbf24", fontWeight: "bold" }}>
                {walletLoading || !wallet
                  ? "..."
                  : showBalance
                    ? `${wallet?.package ?? wallet?.packageBalance ?? wallet?.balance ?? 0} ብር`
                    : "**** ብር"}
              </Typography>
              <button
                onClick={() => setShowBalance(!showBalance)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showBalance ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
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

    </Box>
  );
};

export default CashierDashboard;
