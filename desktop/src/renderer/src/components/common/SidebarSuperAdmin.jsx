import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiHome,
  FiUserPlus,
  FiUsers,
  FiDollarSign,
  FiList,
  FiPlusCircle,
  FiEye,
  FiBarChart2,
  FiLogOut,
} from "react-icons/fi";
import { FaBuilding, FaGift, FaUserTag } from "react-icons/fa";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";

const SidebarSuperAdmin = ({ setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("houseId");
    localStorage.removeItem("tokenExpiration");
    navigate("/login");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex">
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 text-white bg-gray-600 rounded-full shadow-lg hover:bg-red-700 transition-all"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <aside
        className={`transition-all duration-300 bg-gray-600 text-white shadow-lg p-4 ${
          isOpen ? "w-45" : "w-0 overflow-hidden"
        } min-h-screen`}
      >
        <h2 className="text-xl font-bold mb-6">Super Admin</h2>
        <ul className="space-y-4">
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("dashboard")}
          >
            <FiHome />
            <span>Dashboard</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("register-user")}
          >
            <FiUserPlus />
            <span>Register User</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("users-list")}
          >
            <FiUsers />
            <span>Users List</span>
          </li>
          {/* <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("register-house")}
          >
            <FaBuilding />
            <span>Register House</span>
          </li> */}
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("agent-list")} // New link
          >
            <FaUserTag />
            <span>Agent List</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("recharge-history-agent")}
          >
            <PublishedWithChangesIcon />
            <span>Recharge History (Agent)</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("recharge-house")}
          >
            <FiDollarSign />
            <span>Recharge History (houses)</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("house-list")}
          >
            <FiList />
            <span>House List</span>
          </li>
          {/* <li
            className="flex items-center space-x-2 hover:bg-red-700 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("add-cartela")}
          >
            <FiPlusCircle />
            <span>Add Cartela</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-red-700 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("view-cartela")}
          >
            <FiEye />
            <span>View Cartela</span>
          </li> 
           <li
            className="flex items-center space-x-2 hover:bg-red-700 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("reports")}
          >
            <FiBarChart2 />
            <span>Reports</span>
          </li> */}
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("bonuses")}
          >
            <FaGift />
            <span>Bonuses</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-red-600 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>Logout</span>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default SidebarSuperAdmin;
