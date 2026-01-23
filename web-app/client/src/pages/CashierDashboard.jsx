import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Typography, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText,
  Select, MenuItem
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

  // Synchronize state when location state changes
  const incomingTab = location.state?.activeTab;
  if (incomingTab !== prevIncomingTab) {
    setPrevIncomingTab(incomingTab);
    if (incomingTab) {
      setActiveTab(incomingTab);
    }
  }

  const { user, clearUser } = useUserStore();

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [voiceOption, setVoiceOption] = useState("l");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarMinimized(!isSidebarMinimized);

  const handleVoiceChange = (event) => {
    setVoiceOption(event.target.value);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
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

  // Check if on game page for header behavior
  const isGamePage = activeTab === "game";

  // Theme-aware colors
  const sidebarBg = isDarkMode ? "#16213e" : "#017299";
  const headerBg = isDarkMode ? "#16213e" : "transparent";
  const contentBg = isDarkMode ? "#1a1a2e" : "#00b2ff";
  const activeBg = isDarkMode ? "#1a1a2e" : "#03c0ff";
  const activeText = isDarkMode ? "#ffc107" : "#fff521";

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      overflow: "hidden", 
      background: contentBg,
      transition: "background 0.3s ease"
    }}>
      {/* Header */}
      <Box
        sx={{
          height: 56,
          background: headerBg,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          flexShrink: 0,
          zIndex: 1100,
          color: "white",
        }}
      >
        {/* Left: Logo + Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src={logoIcon} alt="Dallol" style={{ height: 32, cursor: "pointer" }} />
          <Typography sx={{ 
            fontFamily: "'Dancing Script', cursive", 
            fontSize: "1.5rem", 
            fontWeight: "bold",
            color: "#ffc107",
            display: isSidebarMinimized ? "none" : "block"
          }}>
            Dallol
          </Typography>
          <IconButton onClick={toggleSidebar} sx={{ color: "white", ml: 2 }}>
            <img src={menuIcon} alt="Menu" style={{ height: 20 }} />
          </IconButton>
        </Box>

        {/* Center: Logo */}
        <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <img src={fullLogo} alt="Dallol Bingo!" style={{ height: 40 }} />
        </Box>

        {/* Right: Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Voice Selector - Shows on game page */}
          {isGamePage && (
            <Select
              value={voiceOption}
              onChange={handleVoiceChange}
              size="small"
              sx={{
                color: "white",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "5px",
                height: 32,
                fontSize: "0.85rem",
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
          )}

          {/* Profile - Shows on non-game pages */}
          {!isGamePage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <img src={userIcon} alt="User" style={{ height: 20, borderRadius: "50%" }} />
              <Typography sx={{ fontWeight: "500", fontSize: "0.9rem" }}>
                {user?.username || "Admin"}
              </Typography>
            </Box>
          )}

          {/* Theme Toggle */}
          <Box 
            onClick={toggleTheme}
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              cursor: "pointer",
              background: isDarkMode ? "#1a1a2e" : "#03c0ff",
              borderRadius: "20px",
              p: 0.5,
              gap: 0.5
            }}
          >
            <Box sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: isDarkMode ? "transparent" : "#ffc107",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {!isDarkMode && <img src={dayIcon} alt="Light" style={{ height: 16 }} />}
            </Box>
            <Box sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: isDarkMode ? "#ffc107" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {isDarkMode && <img src={nightIcon} alt="Dark" style={{ height: 16 }} />}
            </Box>
          </Box>

          {/* Fullscreen Toggle */}
          <IconButton 
            onClick={toggleFullscreen} 
            sx={{ 
              color: "white",
              p: 0.5,
              "&:hover": { background: "rgba(255,255,255,0.1)" }
            }}
          >
            <img src={FullscreenIcon} alt="Fullscreen" style={{ height: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Main Area */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: isSidebarMinimized ? 60 : 200,
            background: sidebarBg,
            transition: "width 0.3s ease, background 0.3s ease",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <List sx={{ mt: 2, px: 0.5 }}>
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5, position: "relative" }}>
                  {/* Active tab curved effect - top */}
                  {isActive && !isSidebarMinimized && (
                    <>
                      <Box sx={{
                        position: "absolute",
                        width: 30,
                        height: 30,
                        top: -30,
                        right: 0,
                        background: sidebarBg,
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          borderRadius: "0 0 50% 0",
                          background: activeBg,
                        }
                      }} />
                      <Box sx={{
                        position: "absolute",
                        width: 30,
                        height: 30,
                        bottom: -30,
                        right: 0,
                        background: sidebarBg,
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          borderRadius: "0 50% 0 0",
                          background: activeBg,
                        }
                      }} />
                    </>
                  )}
                  <ListItemButton
                    onClick={() => setActiveTab(item.id)}
                    selected={isActive}
                    sx={{
                      borderRadius: isSidebarMinimized 
                        ? "8px"
                        : isActive 
                          ? "48px 0 0 48px" 
                          : "48px",
                      justifyContent: isSidebarMinimized ? "center" : "flex-start",
                      px: isSidebarMinimized ? 0 : 2,
                      py: 1.2,
                      ml: isSidebarMinimized ? 0.5 : 0.5,
                      mr: isSidebarMinimized ? 0.5 : 0,
                      transition: "all 0.2s ease",
                      backgroundColor: isActive ? activeBg : "transparent",
                      color: isActive ? activeText : "white",
                      "&.Mui-selected": {
                        backgroundColor: activeBg,
                        color: activeText,
                        "&:hover": {
                          backgroundColor: activeBg,
                        },
                      },
                      "&:hover": {
                        backgroundColor: isActive ? activeBg : "rgba(255, 255, 255, 0.1)",
                        color: isActive ? activeText : "white",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isSidebarMinimized ? 0 : 36,
                        justifyContent: "center",
                        color: isActive ? activeText : "white",
                      }}
                    >
                      {item.muiIcon 
                        ? React.cloneElement(item.muiIcon, { 
                            style: { 
                              color: isActive ? activeText : "white",
                              fontSize: "1.3rem"
                            } 
                          }) 
                        : <img 
                            src={item.icon} 
                            alt={item.label} 
                            style={{ 
                              height: 20, 
                              width: 20,
                              filter: isActive ? "brightness(0) saturate(100%) invert(88%) sepia(40%) saturate(1000%) hue-rotate(5deg)" : "none"
                            }} 
                          />
                      }
                    </ListItemIcon>
                    {!isSidebarMinimized && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? "700" : "500",
                          fontSize: "0.9rem",
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Logout Button */}
          <Box sx={{ mt: "auto", mb: 2, px: 0.5 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: "8px",
                  justifyContent: isSidebarMinimized ? "center" : "flex-start",
                  px: isSidebarMinimized ? 0 : 2,
                  py: 1,
                  ml: 0.5,
                  mr: 0.5,
                  color: "#ff5252",
                  "&:hover": {
                    backgroundColor: "rgba(255, 82, 82, 0.15)",
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: isSidebarMinimized ? 0 : 36, 
                  justifyContent: "center", 
                  color: "inherit" 
                }}>
                  <img src={logoutIcon} alt="Logout" style={{ height: 20, width: 20 }} />
                </ListItemIcon>
                {!isSidebarMinimized && (
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{
                      fontWeight: "600",
                      fontSize: "0.9rem",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: "hidden", 
          display: "flex", 
          flexDirection: "column",
          background: contentBg,
          transition: "background 0.3s ease"
        }}>
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: "auto", 
            p: activeTab === "game" ? 0 : 2 
          }}>
            {renderTabContent()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CashierDashboard;
