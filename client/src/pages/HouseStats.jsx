import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import {
  FaChartLine,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
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
import { debounce } from "lodash";

const HouseStats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "startedAt",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    status: "",
    minStake: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch case data
  const fetchCaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {};
      if (filters.dateRange.start && filters.dateRange.end) {
        params.startDate = filters.dateRange.start;
        params.endDate = filters.dateRange.end;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.minStake) {
        params.minStake = filters.minStake;
      }

      const response = await api.get(
        `/api/cases/house-cases`,
        {
          params,
        }
      );

      setCaseData(response.data);
      setError(null);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch case data";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCaseData();
  }, [fetchCaseData]);

  // Notifications for high-stake games (polling every 30s)
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const response = await api.get(
          `/api/cases/house-cases`,
          {
            params: {
              startDate: todayStart,
              endDate: new Date(),
            },
          }
        );

        const games = response.data.recentGames || [];
        games.forEach((game) => {
          if (game.totalStake > 1000) {
            const message = `High-stake game detected: ${formatCurrency(
              game.totalStake
            )} ETB`;
            setNotifications((prev) => [
              { id: game.gameId, message, timestamp: new Date() },
              ...prev.slice(0, 4),
            ]);
            toast.info(message);
          }
        });
      } catch (err) {}
    };

    pollNotifications();
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Handle filters
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({ ...prev, dateRange: { start, end } }));
  };

  const handleStatusFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  };

  const debouncedHandleMinStakeChange = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, minStake: value }));
      }, 300),
    []
  );

  const handleMinStakeChange = (e) => {
    debouncedHandleMinStakeChange(e.target.value);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      status: "",
      minStake: "",
    });
  };

  // Date presets
  const handleDatePreset = (preset) => {
    const today = new Date();
    let start, end;
    switch (preset) {
      case "today":
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        start = new Date(today.setDate(today.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = null;
        end = null;
    }
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
      status: "",
      minStake: "",
    }));
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!caseData || !caseData.recentGames) return [];
    const groupedByDay = caseData.recentGames.reduce((acc, game) => {
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
  }, [caseData]);

  // Sorted games
  const sortedGames = useMemo(() => {
    if (!caseData || !caseData.recentGames) return [];
    const games = [...caseData.recentGames];
    games.sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      if (key === "startedAt") {
        return direction * (new Date(a[key]) - new Date(b[key]));
      } else if (key === "gameId") {
        // Handle gameId as a number
        const valA = a[key] != null ? Number(a[key]) : 0;
        const valB = b[key] != null ? Number(b[key]) : 0;
        return direction * (valA - valB);
      } else if (key === "winner" || key === "status" || key === "username") {
        // Handle strings, converting null/undefined to empty string
        const valA = a[key] != null ? String(a[key]) : "";
        const valB = b[key] != null ? String(b[key]) : "";
        return direction * valA.localeCompare(valB);
      } else {
        // Handle numeric fields (totalStake, prize, numberOfPlayers)
        const valA = a[key] != null ? parseFloat(a[key]) : 0;
        const valB = b[key] != null ? parseFloat(b[key]) : 0;
        return direction * (valA - valB);
      }
    });
    return games;
  }, [caseData, sortConfig]);

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

  if (!caseData) {
    return (
      <div className="text-center text-gray-400">No case data available.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <FaTimes /> Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date Range
              </label>
              <div className="flex flex-col gap-2">
                <DatePicker
                  selectsRange
                  startDate={filters.dateRange.start}
                  endDate={filters.dateRange.end}
                  onChange={handleDateRangeChange}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                  placeholderText="Select date range"
                  isClearable
                  aria-label="Select date range"
                />
                <div className="flex gap-2 flex-wrap">
                  {["today", "yesterday", "week"].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleDatePreset(preset)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status}
                onChange={handleStatusFilterChange}
                className="w-full p-2 bg-gray-700 rounded text-white"
                aria-label="Select game status"
              >
                <option value="">All</option>
                <option value="Finished">Finished</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Stake (ETB)
              </label>
              <input
                type="number"
                placeholder="Min Stake"
                value={filters.minStake}
                onChange={handleMinStakeChange}
                className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                aria-label="Minimum stake"
              />
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <FaChartLine /> House - {caseData.houseName}
      </h2>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <ul className="space-y-2">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className="p-2 bg-gray-700 rounded text-yellow-300"
              >
                {notif.message} - {formatDate(notif.timestamp)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-600">
          <h3 className="text-lg font-medium">Total Games</h3>
          <p className="text-2xl font-bold text-blue-400">
            {caseData.stats.totalGames}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-600">
          <h3 className="text-lg font-medium">Total Stake (ETB)</h3>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(caseData.stats.totalStake)}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-yellow-600">
          <h3 className="text-lg font-medium">Total Prizes (ETB)</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {formatCurrency(caseData.stats.totalPrize)}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-purple-600">
          <h3 className="text-lg font-medium">Total Profit (ETB)</h3>
          <p className="text-2xl font-bold text-purple-400">
            {formatCurrency(caseData.stats.totalSystemEarnings)}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-red-600">
          <h3 className="text-lg font-medium">Today's Games</h3>
          <p className="text-2xl font-bold text-red-400">
            {caseData.stats.todaysGames}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-indigo-600">
          <h3 className="text-lg font-medium">Total Players Today</h3>
          <p className="text-2xl font-bold text-indigo-400">
            {caseData.stats.totalPlayersToday}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-teal-600">
          <h3 className="text-lg font-medium">Today's Profit (ETB)</h3>
          <p className="text-2xl font-bold text-teal-400">
            {formatCurrency(caseData.stats.totalSystemEarningsToday)}
          </p>
        </div>
        {/* <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-white-600">
          <h3 className="text-lg font-medium">Avg Stake per Game (ETB)</h3>
          <p className="text-2xl font-bold text-teal-400">
            {formatCurrency(caseData.stats.avgStakePerGame)}
          </p>
        </div> */}
      </div>

      {/* Earnings Chart */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Total Stake Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
              formatter={(value) => [
                `${formatCurrency(value)} ETB`,
                "Total Stake",
              ]}
            />
            <Line
              type="monotone"
              dataKey="totalStake"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: "#16a34a", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Games */}
      <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
        <h3 className="text-lg font-semibold p-4">Recent Games</h3>
        {sortedGames.length === 0 ? (
          <p className="p-4 text-gray-400">No games available.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-700">
              <tr>
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
                  className="border-t border-gray-700 hover:bg-gray-600"
                >
                  <td className="p-3">{game.gameId}</td>
                  <td className="p-3">{game.numberOfPlayers}</td>
                  <td className="p-3">{formatCurrency(game.totalStake)}</td>
                  <td className="p-3">{formatCurrency(game.prize)}</td>
                  <td className="p-3">{game.winner || "N/A"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded ${
                        game.status === "Finished"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      } text-black`}
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

export default HouseStats;
