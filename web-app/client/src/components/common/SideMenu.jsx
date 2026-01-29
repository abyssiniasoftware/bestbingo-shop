// src/components/common/SideMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiBook, FiBarChart2, FiLogOut } from "react-icons/fi";

const Sidebar = ({ setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.clear();
    localStorage.clear();
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
        className={`transition-all duration-300 bg-gray-600 text-white shadow-lg p-4 ${isOpen ? "w-45" : "w-0 overflow-hidden"
          } min-h-screen`}
      >
        <h2 className="text-xl font-bold mb-6 mt-8">ሜኑ</h2>
        <ul className="space-y-4">
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("game-board")}
          >
            <FiBook />
            <span>የማጫዎቻ ሰሌዳ</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("bingo-cards")}
          >
            <FiBook />
            <span>የቢንጎ ካርዶች</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={() => handleTabClick("reports")}
          >
            <FiBarChart2 />
            <span>የዛሬ ሪፖርቶች</span>
          </li>
          <li
            className="flex items-center space-x-2 hover:bg-red-600 px-3 py-2 rounded transition-all cursor-pointer"
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>ውጣ</span>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
