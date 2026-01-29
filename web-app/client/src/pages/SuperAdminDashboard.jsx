import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaWallet,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaChartLine,
} from "react-icons/fa";

import SidebarSuperAdmin from "../components/common/SidebarSuperAdmin";
import Register from "../pages/Register";
import UserList from "../pages/UserList";
import CreateHouseForm from "./RegisterHouse";
import RechargeHistory from "./RechargeHistory";
import HouseList from "./HouseList";
import AddCartela from "../pages/AddCartela";
import ViewCartela from "../pages/ViewCartela";
import SuperReports from "./SuperReports";
import BonusList from "./BonusList";
import AgentList from "./AgentList";
import RechargeHistoryAgent from "./RechargeHistoryAgent";
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

const SuperAdminDashboard = () => {
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
        return <SuperReports />;
      case "register-user":
        return <Register />;
      case "users-list":
        return <UserList />;
      case "agent-list":
        return <AgentList />;
      case "recharge-history-agent":
        return <RechargeHistoryAgent />;
      case "register-house":
        return <CreateHouseForm />;
      case "recharge-house":
        return <RechargeHistory />;
      case "house-list":
        return <HouseList />;
      case "add-cartela":
        return <AddCartela />;
      case "view-cartela":
        return <ViewCartela />;
      case "reports":
        return <SuperReports />;
      case "bonuses":
        return <BonusList />;
      default:
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {walletData?.username || "Super Admin"}!
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
      <SidebarSuperAdmin setActiveTab={setActiveTab} />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-white">
            <FaChartLine /> Super Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
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

export default SuperAdminDashboard;
