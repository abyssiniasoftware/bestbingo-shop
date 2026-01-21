import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";
import {
  FaSignOutAlt, FaGamepad, FaIdCard, FaChartBar, FaEye, FaEyeSlash,
  FaFileAlt, FaClipboardList, FaGift, FaWallet, FaCalendarWeek, FaHistory
} from "react-icons/fa";

import ViewCartela from "./ViewCartela";
import Reports from "./Reports";
import HouseReportsCashier from "./HouseReportsCashier";
import HouseBonusListCashier from "./HouseBonusListCashier";
import HouseStatsCashier from "./HouseStatsCashier";
import useWallet from "../hooks/useWallet";
import useUserStore from "../stores/userStore";

const CashierDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => location.state?.activeTab || "reports");
  const { wallet, isLoading: walletLoading } = useWallet();
  const { clearUser } = useUserStore();
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "reports":
        return <Reports />;
      case "detail-report":
        return <HouseReportsCashier />;
      case "bonus-report":
        return <HouseBonusListCashier />;
      case "stats":
        return <HouseStatsCashier />;
      case "bingo-cards":
        return <ViewCartela />;
      default:
        return <Reports />;
    }
  };

  const sidebarItems = [
    { id: "reports", label: "Daily Report", icon: <FaFileAlt /> },
    { id: "detail-report", label: "Detail Report", icon: <FaClipboardList /> },
    { id: "bonus-report", label: "Get Bonus", icon: <FaGift /> },
    { id: "stats", label: "Stats", icon: <FaChartBar /> },
    { id: "bingo-cards", label: "View Cards", icon: <FaIdCard /> },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f6f6f6" }}>
      {/* Full-width Header */}
      <Box
        sx={{
          height: 64,
          background: "white",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          flexShrink: 0,
          zIndex: 1100, // Ensure header is on top
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
          onClick={() => navigate("/game")}
        >
          <Typography variant="h6" sx={{ color: "#2980b9", fontWeight: "bold", fontSize: "1.1rem" }}>
            Play Bingo
          </Typography>
          <img src="/images/bingo.png" alt="Bingo" style={{ height: 24 }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}>
              ቀሪ ሂሳብ: {walletLoading || !wallet
                ? "..."
                : showBalance
                  ? `${wallet?.package ?? wallet?.packageBalance ?? wallet?.balance ?? 0}`
                  : "****"}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowBalance(!showBalance)}
              sx={{ color: "#333" }}
            >
              {showBalance ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Body Area: Sidebar + Content */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 200,
            background: "#1d2b36",
            color: "white",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            {/* Logo placeholder if needed */}
          </Box>

          <List sx={{ flexGrow: 1, px: 1, mt: 2 }}>
            {sidebarItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.id)}
                  selected={activeTab === item.id}
                  sx={{
                    py: 1.5,
                    borderRadius: "0px",
                    "&.Mui-selected": {
                      background: "rgba(255, 255, 255, 0.05)",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 32, fontSize: 16 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.85rem",
                      fontWeight: activeTab === item.id ? 600 : 400
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ background: "rgba(255,255,255,0.1)", my: 1 }} />

          <List sx={{ px: 1, pb: 2 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: "8px",
                  color: "#e74c3c",
                  "&:hover": {
                    background: "rgba(231, 76, 60, 0.1)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40, fontSize: 18 }}>
                  <FaSignOutAlt />
                </ListItemIcon>
                <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.95rem" }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        {/* content Area */}
        <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
          {renderTabContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default CashierDashboard;
