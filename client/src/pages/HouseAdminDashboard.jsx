import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaWallet, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import SidebarHouse from "../components/common/SideMenuHouseAdmin";
import Register from "../pages/Register";
import UserList from "../pages/UserList";
import AddCartela from "../pages/AddCartela";
import ViewCartela from "../pages/ViewCartela";
import HouseReports from "./HouseReports";
import api from "../utils/api";
import HouseStats from "./HouseStats";
import HouseBonusList from "./HouseBonusList";

const apiService = {
  fetchUserData: async (token) => {
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

const HouseAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(
    () => JSON.parse(localStorage.getItem("showAdminBalanceInfo")) || false,
  );

  // Fetch user data (balance and username)
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const data = await apiService.fetchUserData(token);
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
      "showAdminBalanceInfo",
      JSON.stringify(!showSensitiveInfo),
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <HouseStats />;
      // case "register-user":
      //   return <Register />;
      // case "users-list":
      //   return <UserList />;
      // case "add-cartela":
      //   return <AddCartela />;
      // case "view-cartela":
      //   return <ViewCartela />;
      case "reports":
        return <HouseReports />;
      case "bonuses":
        return <HouseBonusList />;
      default:
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {walletData?.username || "Admin"}!
            </h2>
            <p className="text-gray-400">
              Manage users, cartelas, and view reports from this dashboard.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <SidebarHouse setActiveTab={setActiveTab} />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg">
          <h1 className="text-2xl font-bold">House Admin Dashboard</h1>
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
              <span>{walletData?.username || "Admin"}</span>
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

export default HouseAdminDashboard;
