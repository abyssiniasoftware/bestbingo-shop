import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Typography, IconButton, Select, MenuItem
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

import ViewCartela from "./ViewCartela";
import Reports from "./Reports";
import HouseReportsCashier from "./HouseReportsCashier";
import HouseBonusListCashier from "./HouseBonusListCashier";
import HouseStatsCashier from "./HouseStatsCashier";
import Game from "./Game";
import { voiceOptions } from "../constants/constants";
import useUserStore from "../stores/userStore";
import Settings from "./Settings";

// Sidebar Menu Item Component matching base.css exactly
const SidebarItem = ({ icon, muiIcon, label, isActive, onClick, isMinimized, isLogout }) => {
  return (
    <li
      onClick={onClick}
      style={{
        height: 50,
        background: isActive ? 'var(--grey, #03c0ff)' : 'transparent',
        marginLeft: 6,
        borderRadius: '48px 0 0 48px',
        padding: 4,
        position: 'relative',
        cursor: 'pointer',
        marginBottom: 4,
      }}
    >
      {/* Curved shadow effects for active tab */}
      {isActive && !isMinimized && (
        <>
          <div style={{
            content: '',
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            top: -40,
            right: 0,
            boxShadow: '20px 20px 0 var(--grey, #03c0ff)',
            zIndex: -1,
          }} />
          <div style={{
            content: '',
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            bottom: -40,
            right: 0,
            boxShadow: '20px -20px 0 var(--grey, #03c0ff)',
            zIndex: -1,
          }} />
        </>
      )}
      <a
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--light, #017299)',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 48,
          fontSize: 18,
          fontFamily: "'poetsen', sans-serif",
          color: isLogout ? '#DB504A' : (isActive ? 'var(--blue, #e5db19)' : 'white'),
          whiteSpace: 'nowrap',
          overflowX: 'hidden',
          textDecoration: 'none',
          transition: 'color 0.3s ease',
        }}
      >
        <span style={{
          minWidth: isMinimized ? 48 : 'calc(60px - ((4px + 6px) * 2))',
          display: 'flex',
          justifyContent: 'center',
        }}>
          {muiIcon ? (
            React.cloneElement(muiIcon, {
              style: {
                color: isLogout ? '#DB504A' : (isActive ? 'var(--blue, #e5db19)' : 'white'),
                fontSize: 22
              }
            })
          ) : (
            <img
              src={icon}
              alt={label}
              style={{
                width: 22,
                height: 22,
                filter: isActive ? 'brightness(0) saturate(100%) invert(90%) sepia(50%) saturate(500%) hue-rotate(5deg) brightness(100%)' : 'brightness(0) invert(1)'
              }}
            />
          )}
        </span>
        {!isMinimized && (
          <span style={{ marginLeft: 8 }}>{label}</span>
        )}
      </a>
    </li>
  );
};

const CashierDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => location.state?.activeTab || "game");
  const [prevIncomingTab, setPrevIncomingTab] = useState(location.state?.activeTab);

  const incomingTab = location.state?.activeTab;
  if (incomingTab !== prevIncomingTab) {
    setPrevIncomingTab(incomingTab);
    if (incomingTab) {
      setActiveTab(incomingTab);
    }
  }

  const { user, clearUser } = useUserStore();

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark/cyan mode
  const [voiceOption, setVoiceOption] = useState("l");

  // Apply theme CSS variables to document
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.documentElement.style.setProperty('--light', '#017299');
      document.documentElement.style.setProperty('--grey', '#03c0ff');
      document.documentElement.style.setProperty('--body', '#03c0ff');
      document.documentElement.style.setProperty('--blue', '#e5db19');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.style.setProperty('--light', '#030728');
      document.documentElement.style.setProperty('--grey', '#08105b');
      document.documentElement.style.setProperty('--body', '#08105b');
      document.documentElement.style.setProperty('--blue', '#e5db19');
    }
  }, [isDarkMode]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Update state if needed
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

  const sidebarWidth = isSidebarMinimized ? 60 : 200;
  const contentWidth = `calc(100% - ${sidebarWidth}px)`;

  return (
    <Box sx={{
      display: "flex",
      minHeight: "100vh",
      background: 'var(--body, #03c0ff)',
      fontFamily: "'poetsen', sans-serif",
    }}>
      {/* Sidebar - matching base.css #sidebar */}
      <Box
        component="aside"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: sidebarWidth,
          height: '100%',
          background: 'var(--light, #017299)',
          zIndex: 2000,
          transition: '0.3s ease',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* Brand */}
        <Box sx={{
          fontFamily: "'poetsen', sans-serif",
          fontSize: isSidebarMinimized ? 0 : 28,
          fontWeight: 700,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          color: 'var(--blue, #e5db19)',
          position: 'sticky',
          top: 0,
          left: 0,
          background: 'var(--light, #017299)',
          zIndex: 500,
          pb: 2.5,
          pt: 1.5,
          boxSizing: 'content-box',
        }}>
          <Box sx={{ minWidth: 60, display: 'flex', justifyContent: 'center' }}>
            <img src={logoIcon} alt="Dallol" style={{ width: 32, height: 32 }} />
          </Box>
          {!isSidebarMinimized && <span>Dallol</span>}
        </Box>

        {/* Side Menu */}
        <ul style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          width: '100%',
          marginTop: 17,
        }}>
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              muiIcon={item.muiIcon}
              label={item.label}
              isActive={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              isMinimized={isSidebarMinimized}
            />
          ))}

          {/* Logout */}
          <SidebarItem
            icon={logoutIcon}
            label="Logout"
            isActive={false}
            onClick={handleLogout}
            isMinimized={isSidebarMinimized}
            isLogout={true}
          />
        </ul>
      </Box>

      {/* Content Area - matching base.css #content */}
      <Box
        component="main"
        sx={{
          position: 'relative',
          width: contentWidth,
          marginLeft: `${sidebarWidth}px`,
          transition: '0.3s ease',
          minHeight: '100vh',
        }}
      >
        {/* Navbar - matching base.css #content nav */}
        <Box
          component="nav"
          sx={{
            height: 56,
            background: 'var(--light, #017299)',
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3,
            position: 'sticky',
            top: 0,
            left: 0,
            zIndex: 1000,
            '&::before': {
              content: '""',
              position: 'absolute',
              width: 40,
              height: 40,
              bottom: -40,
              left: 0,
              borderRadius: '50%',
              boxShadow: '-20px -20px 0 var(--light, #017299)',
            }
          }}
        >
          {/* Left: Menu button */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={toggleSidebar} sx={{ color: 'white' }}>
              <img src={menuIcon} alt="Menu" style={{ width: 24, height: 24 }} />
            </IconButton>
          </Box>

          {/* Center: Dallol Bingo! Logo */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}>
            <Typography sx={{
              fontFamily: "'pacifico', 'Dancing Script', cursive",
              fontSize: '2.8rem',
              color: '#ffffff',
              letterSpacing: 2,
            }}>
              <span style={{ color: '#ff8d50' }}>D</span>
              allol{' '}
              B
              <span style={{ color: '#15ff00' }}>i</span>
              ngo!
            </Typography>
          </Box>

          {/* Right: Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Voice Selector */}
            <Select
              value={voiceOption}
              onChange={handleVoiceChange}
              size="small"
              sx={{
                color: 'black',
                background: '#fff',
                borderRadius: '5px',
                height: 32,
                width: 70,
                fontSize: '15px',
                fontFamily: "'poetsen', sans-serif",
                "& .MuiSelect-select": { py: 0.5, px: 1 },
                "& fieldset": { border: '1px solid #ccc' },
                "& .MuiSvgIcon-root": { color: 'black' }
              }}
            >
              {voiceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            {/* Theme Toggle */}
            <Box
              onClick={toggleTheme}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <img
                src={isDarkMode ? dayIcon : nightIcon}
                alt="Theme"
                style={{ width: 32, height: 32 }}
              />
            </Box>

            {/* Fullscreen Toggle */}
            <Box
              onClick={toggleFullscreen}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <img src={FullscreenIcon} alt="Fullscreen" style={{ width: 32, height: 32 }} />
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{
          p: activeTab === "game" ? 0 : 2,
          minHeight: 'calc(100vh - 56px)',
        }}>
          {renderTabContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default CashierDashboard;
