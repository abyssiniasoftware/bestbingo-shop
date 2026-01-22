import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider,
  Select, MenuItem, FormControl
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';

import {
  dashboard as dashboardIcon,
  play as playIcon,
  history as historyIcon,
  view as viewIcon,
  logo as logoIcon,
  logout as logoutIcon,
  menu as menuIcon,
  day as dayIcon,
  night as nightIcon,
  full as FullscreenIcon
} from "../images/icon.js";

import { logo as fullLogo, user as userIcon } from "../images/images";


import ViewCartela from "./ViewCartela";
import Reports from "./Reports";
import HouseReportsCashier from "./HouseReportsCashier";
import HouseBonusListCashier from "./HouseBonusListCashier";
import HouseStatsCashier from "./HouseStatsCashier";
import Game from "./Game";
import { voiceOptions } from "../constants/constants";
import useUserStore from "../stores/userStore";
import Settings from "./Settings";


const CashierDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => location.state?.activeTab || "game");
  const [prevIncomingTab, setPrevIncomingTab] = useState(location.state?.activeTab);

  // Synchronize state when location state changes (derived state)
  const incomingTab = location.state?.activeTab;
  if (incomingTab !== prevIncomingTab) {
    setPrevIncomingTab(incomingTab);
    if (incomingTab) {
      setActiveTab(incomingTab);
    }
  }

  const { user, clearUser } = useUserStore();

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false); // Default to expanded as per screenshot
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [voiceOption, setVoiceOption] = useState("l"); // Default voice

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarMinimized(!isSidebarMinimized);

  const handleVoiceChange = (event) => {
    setVoiceOption(event.target.value);
  };



  const renderTabContent = () => {
    switch (activeTab) {
      case "game": {
        const gameParams = location.state?.gameParams || {};
        return (
          <Game
            stake={gameParams.stake}
            players={gameParams.players}
            winAmount={gameParams.winAmount}
            voiceOption={voiceOption}
          />
        );

      }
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
      case "settings":
        return <Settings />;
      default:
        return <Reports />;
    }
  };

  const sidebarItems = [
    { id: "reports", label: "Dashboard", icon: dashboardIcon },
    { id: "game", label: "Play Bingo", icon: playIcon },
    { id: "detail-report", label: "Win History", icon: historyIcon },
    { id: "bingo-cards", label: "View Cartela", icon: viewIcon },
    { id: "settings", label: "Settings", muiIcon: <SettingsIcon /> },
  ];


  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#00b2ff" }}>
      {/* Redesigned Header */}
      <Box
        sx={{
          height: 70,
          background: "#017299",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          flexShrink: 0,
          zIndex: 1100,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img src={logoIcon} alt="Dallol" style={{ height: 40 }} />
          <IconButton onClick={toggleSidebar} sx={{ color: "white", ml: 20 }}>
            <img src={menuIcon} alt="Menu" style={{ height: 24 }} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <img src={fullLogo} alt="Dallol Bingo!" style={{ height: 50 }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={userIcon} alt="User" style={{ height: 24, borderRadius: "50%" }} />
            <Typography sx={{ fontWeight: "bold" }}>{user?.username || "Admin"}</Typography>
          </Box>

          {/* Voice Selector in Header */}
          <Select
            value={voiceOption}
            onChange={handleVoiceChange}
            size="small"
            sx={{
              color: "white",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "5px",
              height: 35,
              "& .MuiSelect-select": { py: 0.5, px: 1 },
              "& fieldset": { border: "none" },
              "& .MuiSvgIcon-root": { color: "white" }
            }}
          >
            {voiceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          <IconButton onClick={() => setIsDarkMode(!isDarkMode)} sx={{ color: "white" }}>
            <img src={isDarkMode ? nightIcon : dayIcon} alt="Theme" style={{ height: 24 }} />
          </IconButton>
          <IconButton sx={{ color: "white" }}>
            <img src={FullscreenIcon} alt="Theme" style={{ height: 24 }} />
          </IconButton>
        </Box>
      </Box>


      {/* Main Area */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Minimized Sidebar */}
        <Box
          sx={{
            width: isSidebarMinimized ? 80 : 240,
            background: "#017299",
            transition: "width 0.3s ease",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <List sx={{ mt: 2, px: 1 }}>
            {sidebarItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 1, position: "relative" }}>
                <ListItemButton
                  onClick={() => setActiveTab(item.id)}
                  selected={activeTab === item.id}
                  sx={{
                    borderRadius: isSidebarMinimized ? "10px" : "25px 0 0 25px",
                    justifyContent: isSidebarMinimized ? "center" : "flex-start",
                    px: isSidebarMinimized ? 0 : 2,
                    height: 50,
                    ml: isSidebarMinimized ? 0 : 2,
                    transition: "all 0.3s ease",
                    backgroundColor: activeTab === item.id ? "white" : "transparent",
                    color: activeTab === item.id ? "#007fa5" : "white",
                    "&.Mui-selected": {
                      backgroundColor: "white",
                      color: "#007fa5",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.9)",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: activeTab === item.id ? "#007fa5" : "white",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isSidebarMinimized ? 0 : 40,
                      justifyContent: "center",
                      color: activeTab === item.id ? "#007fa5" : "white",
                    }}
                  >
                    {item.muiIcon ? React.cloneElement(item.muiIcon, { style: { color: activeTab === item.id ? "#007fa5" : "white" } }) : <img src={item.icon} alt={item.label} style={{ height: 24, width: 24, filter: activeTab === item.id ? "invert(40%) sepia(20%) saturate(2000%) hue-rotate(160deg)" : "none" }} />}
                  </ListItemIcon>
                  {!isSidebarMinimized && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: activeTab === item.id ? "bold" : "normal",
                        fontSize: "1rem",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}


          </List>

          <Box sx={{ mt: "auto", mb: 2, px: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: "10px",
                  justifyContent: isSidebarMinimized ? "center" : "flex-start",
                  px: isSidebarMinimized ? 0 : 2,
                  color: "#ff5252",
                  "&:hover": {
                    backgroundColor: "rgba(255, 82, 82, 0.1)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: isSidebarMinimized ? 0 : 40, justifyContent: "center", color: "inherit" }}>
                  <img src={logoutIcon} alt="Logout" style={{ height: 24, width: 24 }} />
                </ListItemIcon>
                {!isSidebarMinimized && (
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </Box>
        </Box>

        {/* Content Area with Rounded Container */}
        <Box sx={{ flexGrow: 1, p: 2, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              flexGrow: 1,
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ flexGrow: 1, overflowY: "auto", p: activeTab === "game" ? 0 : 3 }}>
              {renderTabContent()}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

 export default CashierDashboard;
