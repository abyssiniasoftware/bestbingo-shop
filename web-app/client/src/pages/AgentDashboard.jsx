import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaWallet,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaChartLine,
} from "react-icons/fa";
import SidebarAgent from "../components/common/SidebarAgent";
import Register from "./Register";
import AgentUserList from "./AgentUserList";
import CreateHouseForm from "./RegisterHouse";
import AgentRechargeHistory from "./AgentRechargeHistory";
import AgentHouseList from "./AgentHouseList";
import AddCartela from "./AddCartela";
import ViewCartela from "./ViewCartela";
import AgentReports from "./AgentReports";
import AgentBonusList from "./AgentBonusList";
import api from "../utils/api";

const apiService = {
  fetchUserData: async () => {
    try {
      const response = await api.get(`/api/me`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user data",
      );
    }
  },
};

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(
    () =>
      JSON.parse(localStorage.getItem("showSuperAdminBalanceInfo")) || false,
  );

  // Fetch user data (balance and username)
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.fetchUserData();
        setWalletData({ package: data.package, username: data.username });
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const toggleSensitiveInfo = () => {
    setShowSensitiveInfo((prev) => !prev);
    localStorage.setItem(
      "showSuperAdminBalanceInfo",
      JSON.stringify(!showSensitiveInfo),
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AgentReports />;
      case "register-user":
        return <Register />;
      case "users-list":
        return <AgentUserList />;
      case "register-house":
        return <CreateHouseForm />;
      case "recharge-house":
        return <AgentRechargeHistory />;
      case "house-list":
        return <AgentHouseList />;
      case "add-cartela":
        return <AddCartela />;
      case "view-cartela":
        return <ViewCartela />;
      case "bonuses":
        return <AgentBonusList />;
      default:
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {walletData?.username || "Agent"}!
            </h2>
            <p className="text-gray-400">
              Manage houses, users, cartelas, and view reports from this
              dashboard.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <SidebarAgent setActiveTab={setActiveTab} />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-white">
            <FaChartLine /> Agent Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaWallet />
              <span>
                Balance:{" "}
                {isLoading
                  ? "Loading..."
                  : showSensitiveInfo
                    ? `${(walletData?.package || 0).toFixed(2)} ETB`
                    : "****"}
              </span>
              <button
                onClick={toggleSensitiveInfo}
                className="text-white hover:text-gray-300 transition"
                aria-label={
                  showSensitiveInfo
                    ? "Hide sensitive information"
                    : "Show sensitive information"
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
              <span>{walletData?.username || "Super Admin"}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
