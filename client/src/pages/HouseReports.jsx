import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import {
  FaChartLine,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { debounce } from "lodash";

const HouseReports = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    numberOfPlayers: { min: "", max: "" },
    betAmount: { min: "", max: "" },
    totalStake: { min: "", max: "" },
    cutAmountPercent: { min: "", max: "" },
    prize: { min: "", max: "" },
    systemEarnings: { min: "", max: "" },
    winnerNumber: "",
    month: "",
    dateRange: { start: null, end: null },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showTopFilters, setShowTopFilters] = useState(false);
  const [showBottomFilters, setShowBottomFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch house stats from the API
  useEffect(() => {
    const fetchHouseStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const params = {};
        if (filters.dateRange.start && filters.dateRange.end) {
          params.startDate = filters.dateRange.start.toISOString().slice(0, 10);
          params.endDate = filters.dateRange.end.toISOString().slice(0, 10);
        } else if (filters.month) {
          params.month = filters.month;
        }

        const response = await api.get(`/api/stats/house`, {
          params,
        });

        setStats(response.data);
        setError(null);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch house stats";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouseStats();
  }, [filters.month, filters.dateRange.start, filters.dateRange.end]);

  // Real-time notifications (polling every 30 seconds)
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const response = await api.get(`/api/stats/house`, {
          params: {
            startDate: todayStart.toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10),
          },
        });

        const games = response.data.gameHistory || [];
        games.forEach((game) => {
          if (game.totalStake > 1000 || game.numberOfPlayers > 50) {
            const message =
              game.totalStake > 1000
                ? `High-stake game detected: ${formatCurrency(
                    game.totalStake,
                  )} ETB`
                : `High player count: ${game.numberOfPlayers} players`;
            setNotifications((prev) => [
              { id: game.date, message, timestamp: new Date() },
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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-ET", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handle sorting
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  }, []);

  // Debounced filter change handler
  const handleFilterChange = useCallback((value, field, type) => {
    setFilters((prev) => ({
      ...prev,
      [field]: { ...prev[field], [type]: value },
    }));
    setCurrentPage(1);
  }, []);

  const debouncedHandleFilterChange = useMemo(
    () => debounce(handleFilterChange, 300),
    [handleFilterChange],
  );

  const handleWinnerFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      winnerNumber: e.target.value,
    }));
    setCurrentPage(1);
  };

  const handleMonthFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      month: e.target.value,
      dateRange: { start: null, end: null }, // Clear date range when month is selected
    }));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
      month: "", // Clear month when date range is selected
    }));
    setCurrentPage(1);
  };

  // Date range presets
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
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = null;
        end = null;
    }
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
      month: "",
    }));
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      numberOfPlayers: { min: "", max: "" },
      betAmount: { min: "", max: "" },
      totalStake: { min: "", max: "" },
      cutAmountPercent: { min: "", max: "" },
      prize: { min: "", max: "" },
      systemEarnings: { min: "", max: "" },
      winnerNumber: "",
      month: "",
      dateRange: { start: null, end: null },
    });
    setCurrentPage(1);
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = [
      {
        "Report Generated": new Date().toLocaleString("en-ET"),
        "Total profit (ETB)": stats
          ? formatCurrency(stats.totalDailyEarnings)
          : "N/A",
        "Total Games Played": stats ? stats.totalGamesPlayed : "N/A",
        "Today's Games": stats ? stats.todaysGames : "N/A",
      },
      ...filteredAndSortedGames.map((game) => ({
        "Game Date & Time": formatDate(game.date),
        "Stake per Player (ETB)": formatCurrency(game.betAmount),
        "Number of Players": game.numberOfPlayers,
        "Total Stakes (ETB)": formatCurrency(game.totalStake),
        "House Commission (%)": game.cutAmountPercent,
        "Prize Amount (ETB)": formatCurrency(game.prize),
        "Winner Card ID": game.winnerNumber || "None",
        "House Profit (ETB)": formatCurrency(game.systemEarnings),
      })),
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `house_reports_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel
  const exportToExcel = () => {
    const excelData = [
      {
        "Report Generated": new Date().toLocaleString("en-ET"),
        "Total profit (ETB)": stats
          ? formatCurrency(stats.totalDailyEarnings)
          : "N/A",
        "Total Games Played": stats ? stats.totalGamesPlayed : "N/A",
        "Today's Games": stats ? stats.todaysGames : "N/A",
      },
      ...filteredAndSortedGames.map((game) => ({
        "Game Date & Time": formatDate(game.date),
        "Stake per Player (ETB)": formatCurrency(game.betAmount),
        "Number of Players": game.numberOfPlayers,
        "Total Stakes (ETB)": formatCurrency(game.totalStake),
        "House Commission (%)": game.cutAmountPercent,
        "Prize Amount (ETB)": formatCurrency(game.prize),
        "Winner Card ID": game.winnerNumber || "None",
        "House Profit (ETB)": formatCurrency(game.systemEarnings),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "House Reports");
    XLSX.writeFile(
      workbook,
      `house_reports_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("House Reports", 20, 10);
    autoTable(doc, {
      head: [["Metric", "Value"]],
      body: [
        ["Report Generated", new Date().toLocaleString("en-ET")],
        [
          "Total Profit (ETB)",
          stats ? formatCurrency(stats.totalDailyEarnings) : "N/A",
        ],
        ["Total Games Played", stats ? stats.totalGamesPlayed : "N/A"],
        ["Today's Games", stats ? stats.todaysGames : "N/A"],
      ],
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 163, 74] },
    });
    autoTable(doc, {
      head: [
        [
          "Game Date & Time",
          "Stake per Player (ETB)",
          "Number of Players",
          "Total Stakes (ETB)",
          "House Commission (%)",
          "Prize Amount (ETB)",
          "Winner Card ID",
          "House Profit (ETB)",
        ],
      ],
      body: filteredAndSortedGames.map((game) => [
        formatDate(game.date),
        formatCurrency(game.betAmount),
        game.numberOfPlayers,
        formatCurrency(game.totalStake),
        game.cutAmountPercent,
        formatCurrency(game.prize),
        game.winnerNumber || "None",
        formatCurrency(game.systemEarnings),
      ]),
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 163, 74] },
    });
    doc.save(`house_reports_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Filtered and sorted data
  const filteredAndSortedGames = useMemo(() => {
    if (!stats || !stats.gameHistory) return [];

    let filtered = [...stats.gameHistory];

    // Apply local filters
    filtered = filtered.filter((game) => {
      const players = game.numberOfPlayers;
      const bet = game.betAmount;
      const stake = game.totalStake;
      const cut = game.cutAmountPercent;
      const prize = game.prize;
      const earnings = game.systemEarnings;
      const winner = game.winnerNumber;
      const gameDate = new Date(game.date);

      const {
        numberOfPlayers,
        betAmount,
        totalStake,
        cutAmountPercent,
        prize: prizeFilter,
        systemEarnings,
        winnerNumber,
        dateRange,
      } = filters;

      return (
        (!numberOfPlayers.min || players >= parseFloat(numberOfPlayers.min)) &&
        (!numberOfPlayers.max || players <= parseFloat(numberOfPlayers.max)) &&
        (!betAmount.min || bet >= parseFloat(betAmount.min)) &&
        (!betAmount.max || bet <= parseFloat(betAmount.max)) &&
        (!totalStake.min || stake >= parseFloat(totalStake.min)) &&
        (!totalStake.max || stake <= parseFloat(totalStake.max)) &&
        (!cutAmountPercent.min || cut >= parseFloat(cutAmountPercent.min)) &&
        (!cutAmountPercent.max || cut <= parseFloat(cutAmountPercent.max)) &&
        (!prizeFilter.min || prize >= parseFloat(prizeFilter.min)) &&
        (!prizeFilter.max || prize <= parseFloat(prizeFilter.max)) &&
        (!systemEarnings.min || earnings >= parseFloat(systemEarnings.min)) &&
        (!systemEarnings.max || earnings <= parseFloat(systemEarnings.max)) &&
        (!winnerNumber || (winnerNumber === "hasWinner" ? winner : !winner)) &&
        (!dateRange.start || gameDate >= dateRange.start) &&
        (!dateRange.end || gameDate <= dateRange.end)
      );
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === "asc" ? 1 : -1;

      if (key === "date") {
        return direction * (new Date(a.date) - new Date(b.date));
      } else if (key === "winnerNumber") {
        const valA = a.winnerNumber || "";
        const valB = b.winnerNumber || "";
        return direction * valA.localeCompare(valB);
      } else {
        return direction * ((a[key] || 0) - (b[key] || 0));
      }
    });

    return filtered;
  }, [stats, sortConfig, filters]);

  // Top games (top 5 by House Profit)
  const topGames = useMemo(() => {
    if (!stats || !stats.gameHistory) return [];
    return [...stats.gameHistory]
      .sort((a, b) => b.systemEarnings - a.systemEarnings)
      .slice(0, 5);
  }, [stats]);

  // Average earnings per game
  const avgEarningsPerGame = useMemo(() => {
    if (!stats || !stats.gameHistory || stats.totalGamesPlayed === 0) return 0;
    return stats.totalDailyEarnings / stats.totalGamesPlayed;
  }, [stats]);

  // Pagination
  const totalItems = filteredAndSortedGames.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedGames = filteredAndSortedGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Render pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? "bg-green-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-700 rounded text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-700 rounded text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
        <div className="flex items-center gap-2">
          <label className="text-gray-300">Rows per page:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-1 bg-gray-700 rounded text-white border border-gray-600"
          >
            {[10, 25, 50].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // Generate month options (last 12 months)
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;
      const label = date.toLocaleString("en-ET", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }
    return options;
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!stats || !stats.gameHistory) return [];
    const groupedByDay = stats.gameHistory.reduce((acc, game) => {
      const date = new Date(game.date).toLocaleDateString("en-ET", {
        day: "numeric",
        month: "short",
      });
      acc[date] = (acc[date] || 0) + game.systemEarnings;
      return acc;
    }, {});
    return Object.entries(groupedByDay).map(([date, earnings]) => ({
      date,
      earnings,
    }));
  }, [stats]);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaChartLine /> House Reports
      </h1>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}

      {error && (
        <p className="text-red-500 bg-red-900/50 p-3 rounded w-full">
          Error: {error}
        </p>
      )}

      {stats && !isLoading && (
        <div className="w-full">
          {/* Top Filters (Date Range, Month) */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowTopFilters(!showTopFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <FaFilter /> {showTopFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {showTopFilters && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Main Filters</h2>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <FaTimes /> Reset Filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
                      placeholderText="Select date range"
                      isClearable
                      aria-label="Select date range"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {["today", "yesterday", "week", "month"].map((preset) => (
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
                  <label className="block text-sm font-medium mb-1">
                    Month
                  </label>
                  <select
                    value={filters.month}
                    onChange={handleMonthFilterChange}
                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
                    aria-label="Select month"
                  >
                    <option value="">All Time</option>
                    {getMonthOptions().map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-2">Notifications</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-600">
              <h2 className="text-lg font-semibold">Package Balance (ETB)</h2>
              <p className="text-2xl text-green-400">
                {formatCurrency(stats.packageBalance)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-yellow-500">
              <h2 className="text-lg font-semibold">Total profit (ETB)</h2>
              <p className="text-2xl text-yellow-400">
                {formatCurrency(stats.totalDailyEarnings)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-red-600">
              <h2 className="text-lg font-semibold">Total Games Played</h2>
              <p className="text-2xl text-red-400">{stats.totalGamesPlayed}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-600">
              <h2 className="text-lg font-semibold">Today's Games</h2>
              <p className="text-2xl text-blue-400">{stats.todaysGames}</p>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Earnings Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                  formatter={(value) => [
                    `${formatCurrency(value)} ETB`,
                    "Earnings",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: "#16a34a", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Games */}
          {topGames.length > 0 && (
            <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">
                Top 5 Games by Earnings
              </h2>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3">Game Date & Time</th>
                    <th className="p-3">Number of Players</th>
                    <th className="p-3">Total Stakes (ETB)</th>
                    <th className="p-3">House Profit (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {topGames.map((game, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-700 hover:bg-gray-700"
                    >
                      <td className="p-3">{formatDate(game.date)}</td>
                      <td className="p-3">{game.numberOfPlayers}</td>
                      <td className="p-3">{formatCurrency(game.totalStake)}</td>
                      <td className="p-3">
                        {formatCurrency(game.systemEarnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Filters Toggle and Export Buttons */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <button
              onClick={() => setShowBottomFilters(!showBottomFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <FaFilter /> {showBottomFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                <FaDownload /> CSV
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <FaDownload /> Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <FaDownload /> PDF
              </button>
            </div>
          </div>

          {/* Bottom Filters */}
          {showBottomFilters && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Additional Filters</h2>
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
                    Number of Players
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.numberOfPlayers.min}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "numberOfPlayers",
                          "min",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Minimum number of players"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.numberOfPlayers.max}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "numberOfPlayers",
                          "max",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Maximum number of players"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stake per Player (ETB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.betAmount.min}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "betAmount",
                          "min",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Minimum stake per player"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.betAmount.max}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "betAmount",
                          "max",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Maximum stake per player"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Stakes (ETB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.totalStake.min}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "totalStake",
                          "min",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Minimum total stakes"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.totalStake.max}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "totalStake",
                          "max",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Maximum total stakes"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    House Commission (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.cutAmountPercent.min}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "cutAmountPercent",
                          "min",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Minimum house commission"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.cutAmountPercent.max}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "cutAmountPercent",
                          "max",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Maximum house commission"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prize Amount (ETB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.prize.min}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "prize",
                          "min",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Minimum prize amount"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.prize.max}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "prize",
                          "max",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Maximum prize amount"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    House Profit (ETB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.systemEarnings.min}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "systemEarnings",
                          "min",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Minimum House Profit"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.systemEarnings.max}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "systemEarnings",
                          "max",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Maximum House Profit"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Winner Card ID
                  </label>
                  <select
                    value={filters.winnerNumber}
                    onChange={handleWinnerFilterChange}
                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
                    aria-label="Select winner card ID filter"
                  >
                    <option value="">All</option>
                    <option value="hasWinner">Has Winner</option>
                    <option value="noWinner">No Winner</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Game History Table */}
          <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
            <h2 className="text-lg font-semibold p-4">Game History</h2>
            {filteredAndSortedGames.length === 0 ? (
              <p className="p-4 text-gray-400">
                No games match the current filters.
              </p>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-700">
                      {[
                        { label: "Game Date & Time", key: "date" },
                        { label: "Stake per Player (ETB)", key: "betAmount" },
                        { label: "Number of Players", key: "numberOfPlayers" },
                        { label: "Total Stakes (ETB)", key: "totalStake" },
                        {
                          label: "House Commission (%)",
                          key: "cutAmountPercent",
                        },
                        { label: "Prize Amount (ETB)", key: "prize" },
                        { label: "Winner Card ID", key: "winnerNumber" },
                        { label: "House Profit (ETB)", key: "systemEarnings" },
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
                    {paginatedGames.map((game, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-700 hover:bg-gray-700"
                      >
                        <td className="p-3">{formatDate(game.date)}</td>
                        <td className="p-3">
                          {formatCurrency(game.betAmount)}
                        </td>
                        <td className="p-3">{game.numberOfPlayers}</td>
                        <td className="p-3">
                          {formatCurrency(game.totalStake)}
                        </td>
                        <td className="p-3">{game.cutAmountPercent}%</td>
                        <td className="p-3">{formatCurrency(game.prize)}</td>
                        <td className="p-3">{game.winnerNumber || "None"}</td>
                        <td className="p-3">
                          {formatCurrency(game.systemEarnings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {renderPagination()}
              </>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-800 p-4 rounded-lg shadow mt-8">
            <h2 className="text-lg font-semibold mb-2">Performance Metrics</h2>
            <p className="text-gray-300">
              Average Earnings per Game: {formatCurrency(avgEarningsPerGame)}{" "}
              ETB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseReports;
