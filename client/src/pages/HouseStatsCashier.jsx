import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { FaChartLine, FaDownload, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const HouseStatsCashier = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "startedAt",
    direction: "desc",
  });

  // Fetch case data
  const fetchCaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/cases/house-cases`);
      setStats(response.data);
      setError(null);
    } catch {
      setError("Failed to fetch case data");
      toast.error("Failed to fetch game history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaseData();
  }, [fetchCaseData]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-ET", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Handle sorting
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  }, []);

  // Removed handleSearch as it is not used by the current JSX and is a placeholder

  // Chart data
  const chartData = useMemo(() => {
    if (!stats || !stats.recentGames) return [];
    const groupedByDay = stats.recentGames.reduce((acc, game) => {
      const date = new Date(game.startedAt).toLocaleDateString("en-ET", {
        day: "numeric",
        month: "short",
      });
      acc[date] = (acc[date] || 0) + parseFloat(game.totalStake);
      return acc;
    }, {});
    return Object.entries(groupedByDay).map(([date, totalStake]) => ({
      date,
      totalStake,
    }));
  }, [stats]);

  // Sorted games
  const sortedGames = useMemo(() => {
    if (!stats || !stats.recentGames) return [];
    const games = [...stats.recentGames];
    games.sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      if (key === "startedAt") {
        return direction * (new Date(a[key]) - new Date(b[key]));
      } else if (key === "gameId") {
        const valA = a[key] != null ? Number(a[key]) : 0;
        const valB = b[key] != null ? Number(b[key]) : 0;
        return direction * (valA - valB);
      } else if (key === "winner" || key === "status" || key === "username") {
        const valA = a[key] != null ? String(a[key]) : "";
        const valB = b[key] != null ? String(b[key]) : "";
        return direction * valA.localeCompare(valB);
      } else {
        const valA = a[key] != null ? parseFloat(a[key]) : 0;
        const valB = b[key] != null ? parseFloat(b[key]) : 0;
        return direction * (valA - valB);
      }
    });
    return games;
  }, [stats, sortConfig]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-900/50 p-3 rounded">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-400">No case data available.</div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold mb-6 text-[#2980b9]">
        House Stats
      </h1>

      {/* Main Filters Bar */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">From:</span>
          <input type="date" className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">To:</span>
          <input type="date" className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <select className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
        <button className="ml-auto px-5 py-1.5 bg-[#2980b9] text-white rounded text-sm font-bold hover:bg-[#2471a3] transition-colors">
          Search
        </button>
      </div>

      <h2 className="text-lg font-bold mb-4 text-[#2980b9]">
        House - {stats.houseName}
      </h2>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100 border-l-4 border-l-[#2980b9]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Games</h3>
          <p className="text-xl font-bold text-gray-800">
            {stats.stats.totalGames}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100 border-l-4 border-l-[#27ae60]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Stake</h3>
          <p className="text-xl font-bold text-gray-800">
            {formatCurrency(stats.stats.totalStake)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100 border-l-4 border-l-[#f1c40f]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Prizes</h3>
          <p className="text-xl font-bold text-gray-800">
            {formatCurrency(stats.stats.totalPrize)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100 border-l-4 border-l-[#e74c3c]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Profit</h3>
          <p className="text-xl font-bold text-gray-800">
            {formatCurrency(stats.stats.totalSystemEarnings)}
          </p>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-bold mb-4 text-[#2980b9]">Total Stake Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #eee" }}
              formatter={(value) => [
                `${formatCurrency(value)} ETB`,
                "Total Stake",
              ]}
            />
            <Line
              type="monotone"
              dataKey="totalStake"
              stroke="#2980b9"
              strokeWidth={2}
              dot={{ fill: "#2980b9", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Games */}
      <div className="bg-white rounded shadow-sm overflow-x-auto border border-gray-200">
        <h3 className="text-lg font-bold p-3 text-[#2980b9] bg-gray-50 border-b border-gray-100">Recent Games</h3>
        {sortedGames.length === 0 ? (
          <p className="p-4 text-gray-400">No games available.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2980b9] text-white">
              <tr className="border-b border-[#2471a3]">
                {[
                  { label: "Game No.", key: "gameId" },
                  { label: "Players", key: "numberOfPlayers" },
                  { label: "Total Stake (ETB)", key: "totalStake" },
                  { label: "Prize (ETB)", key: "prize" },
                  { label: "Winner", key: "winner" },
                  { label: "Status", key: "status" },
                  { label: "Started", key: "startedAt" },
                  { label: "User", key: "username" },
                ].map(({ label, key }) => (
                  <th
                    key={key}
                    className="p-3 cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort(key)}
                    aria-sort={
                      sortConfig.key === key
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {sortConfig.key === key ? (
                        sortConfig.direction === "asc" ? (
                          <FaSortUp aria-label="Sorted ascending" />
                        ) : (
                          <FaSortDown aria-label="Sorted descending" />
                        )
                      ) : (
                        <FaSort
                          className="text-gray-400"
                          aria-label="Sortable"
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedGames.map((game) => (
                <tr
                  key={game.gameId}
                  className="border-t border-gray-100 hover:bg-gray-50 text-gray-700"
                >
                  <td className="p-3">{game.gameId}</td>
                  <td className="p-3">{game.numberOfPlayers}</td>
                  <td className="p-3">{formatCurrency(game.totalStake)}</td>
                  <td className="p-3">{formatCurrency(game.prize)}</td>
                  <td className="p-3">{game.winner || "N/A"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${game.status === "Finished"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {game.status || "N/A"}
                    </span>
                  </td>
                  <td className="p-3">{formatDate(game.startedAt)}</td>
                  <td className="p-3">{game.username || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HouseStatsCashier;
