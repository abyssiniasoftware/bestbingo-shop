import React from "react";
import { Link } from "react-router-dom";
import config from "../../constants/config";
const Welcome = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <img src={config.logo} alt="Smart Bingo" className="w-64 mb-8" />
    <h1 className="text-4xl font-bold mb-4">Welcome to Smart Bingo</h1>
    <p className="text-lg mb-4">No games created yet. Start now!</p>
    <p className="text-lg mb-8">የተጀመረ ጌም የሎዎትም አሁኑኑ ይጀምሩ</p>
    <Link
      to="/new-game"
      className="btn bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
    >
      Start New Game
    </Link>
    <Link
      to="/view-cartela"
      className="btn bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 mt-4"
    >
      Check Cartela / ካርቴላ ያረጋግጡ
    </Link>
  </div>
);

export default Welcome;
