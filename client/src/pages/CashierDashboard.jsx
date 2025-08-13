import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaWallet, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import Sidebar from "../components/common/SideMenu";
import NewGame from "./NewGame";
import ViewCartela from "./ViewCartela";
import Reports from "./Reports";
import useUserStore from "../stores/userStore";
import axios from "axios";
import config from "../constants/config";

// API service layer
const apiService = {
  fetchUserData: async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/me`,
        {
          headers: { "x-auth-token": token },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "የተጠቃሚ መረጃ ለማግኘት አልተቻለም"
      );
    }
  },
};

const CashierDashboard = () => {
  const [activeTab, setActiveTab] = useState("game-board");
  const [isLoading, setIsLoading] = useState(false);
  const { userId, walletData, setWalletData, setError } = useUserStore();
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(
    () => JSON.parse(localStorage.getItem("showBalanceInfo")) || false
  );

  // Fetch user data (balance and username)
  useEffect(() => {
    const fetchUserData = async () => {
      const effectiveUserId = userId || localStorage.getItem("userId");
      if (!effectiveUserId) {
        toast.error("የተጠቃሚ መለያ አልተገኘም። እባክዎ ዳግም ይግቡ");
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const data = await apiService.fetchUserData(token);
        setWalletData({ package: data.package, username: data.username });
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId, setWalletData, setError]);

  const toggleSensitiveInfo = () => {
    setShowSensitiveInfo((prev) => !prev);
    localStorage.setItem("showBalanceInfo", JSON.stringify(!showSensitiveInfo));
  };

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
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar setActiveTab={setActiveTab} />
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center bg-gray-800 p-4 rounded-lg gap-4">
            <h1 className="text-2xl font-bold">የአጫዋች ዳሽቦርድ</h1>
            <div className="text-sm sm:text-base font-semibold">
              {config.phoneNumber}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FaWallet />
                <span>
                  ቀሪ ሒሳብ:{" "}
                  {isLoading
                    ? "በመጫን ላይ..."
                    : showSensitiveInfo
                    ? `${(walletData?.package || 0).toFixed(2)} ብር`
                    : "****"}
                </span>
                <button
                  onClick={toggleSensitiveInfo}
                  className="text-white hover:text-gray-300 transition"
                  aria-label={
                    showSensitiveInfo ? "ሚስጥራዊ መረጃ ደብቅ" : "ሚስጥራዊ መረጃ አሳይ"
                  }
                >
                  {showSensitiveInfo ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <FaUser />
                <span>{walletData?.username || "ገንዘብ ተቀባይ"}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-800 rounded-lg shadow p-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
