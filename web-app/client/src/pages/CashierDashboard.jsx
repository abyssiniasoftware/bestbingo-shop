import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

// Import cashier-specific styles
import "../styles/cashier.css";

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
} from "../images/icon";

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

  const incomingTab = location.state?.activeTab;
  if (incomingTab !== prevIncomingTab) {
    setPrevIncomingTab(incomingTab);
    if (incomingTab) {
      setActiveTab(incomingTab);
    }
  }

  const { user, clearUser } = useUserStore();

  // Sidebar minimized by default
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [voiceOption, setVoiceOption] = useState("a2");

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => { };
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

  // Check if we're on the game tab (Play Bingo)
  const isGameTab = activeTab === "game";

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

  // Get username for display
  const username = user?.username || user?.name || "User";

  return (
    <div className={`cashier-dashboard ${isDarkMode ? 'dark-mode' : ''}`} style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "var(--body)",
      fontFamily: "'poetsen', sans-serif",
    }}>
      {/* Sidebar */}
      <aside className={`cashier-sidebar ${isSidebarMinimized ? 'hide' : ''}`}>
        {/* Brand */}
        <div className="brand">
          <span className="bx">
            <img src={logoIcon} alt="Logo" style={{ width: 32, height: 32 }} />
          </span>
          {!isSidebarMinimized && <span>Dallol</span>}
        </div>

        {/* Side Menu */}
        <ul className="side-menu top">
          {sidebarItems.map((item) => (
            <li
              key={item.id}
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => setActiveTab(item.id)}
            >
              <a href="#">
                <span className="bx">
                  {item.muiIcon ? (
                    React.cloneElement(item.muiIcon, {
                      style: {
                        color: activeTab === item.id ? 'var(--blue)' : 'rgba(255,255,255,0.8)',
                        fontSize: 22
                      }
                    })
                  ) : (
                    <img
                      src={item.icon}
                      alt={item.label}
                      style={{
                        width: 22,
                        height: 22,
                        filter: activeTab === item.id
                          ? 'brightness(0) saturate(100%) invert(90%) sepia(50%) saturate(500%) hue-rotate(5deg) brightness(100%)'
                          : 'brightness(0) invert(1) opacity(0.8)'
                      }}
                    />
                  )}
                </span>
                {!isSidebarMinimized && <span style={{ marginLeft: 8 }}>{item.label}</span>}
              </a>
            </li>
          ))}

          {/* Logout */}
          <li onClick={handleLogout}>
            <a href="#" className="logout">
              <span className="bx">
                <img
                  src={logoutIcon}
                  alt="Logout"
                  style={{
                    width: 22,
                    height: 22,
                    filter: 'invert(35%) sepia(80%) saturate(1000%) hue-rotate(330deg) brightness(90%)'
                  }}
                />
              </span>
              {!isSidebarMinimized && <span style={{ marginLeft: 8 }}>Logout</span>}
            </a>
          </li>
        </ul>
      </aside>

      {/* Content Area */}
      <main style={{
        position: 'relative',
        width: isSidebarMinimized ? 'calc(100% - 60px)' : 'calc(100% - 200px)',
        marginLeft: isSidebarMinimized ? 60 : 200,
        transition: '0.3s ease',
        minHeight: '100vh',
      }}>
        {/* Navbar */}
        <nav className="cashier-navbar">
          {/* Left: Menu button */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={menuIcon}
              alt="Menu"
              onClick={toggleSidebar}
              style={{
                width: 24,
                height: 24,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
              }}
            />
          </div>

          {/* Center: Dallol Bingo! Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}>
            <span className="header-text-gradient">
              <span className="header-d">Dallol</span>
              {' '}
              Bin
              <span className="header-i">g</span>
              o!
            </span>
          </div>

          {/* Right: Conditional - Voice selector on game tab, Profile on others */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isGameTab ? (
              /* Voice Selector - Only on Play Bingo tab */
              <select
                value={voiceOption}
                onChange={handleVoiceChange}
                style={{
                  color: 'black',
                  background: '#fff',
                  borderRadius: 5,
                  height: 32,
                  width: 70,
                  fontSize: 15,
                  fontFamily: "'poetsen', sans-serif",
                  padding: '5px',
                  border: '1px solid #ccc',
                }}
              >
                {voiceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              /* Profile icon + Username - On non-game tabs */
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#ffce26',
                fontFamily: "'poetsen', sans-serif",
                fontSize: 16,
              }}>
                <PersonIcon style={{ color: '#ffce26', fontSize: 24 }} />
                <span>{username}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <img
              src={isDarkMode ? nightIcon : dayIcon}
              alt="Theme"
              onClick={toggleTheme}
              style={{
                width: 32,
                height: 32,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
              }}
            />

            {/* Fullscreen Toggle */}
            <img
              src={FullscreenIcon}
              alt="Fullscreen"
              onClick={toggleFullscreen}
              style={{
                width: 32,
                height: 32,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
              }}
            />
          </div>
        </nav>

        {/* Main Content */}
        <div style={{
          padding: activeTab === "game" ? 0 : 16,
          minHeight: 'calc(100vh - 80px)',
        }}>
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default CashierDashboard;
