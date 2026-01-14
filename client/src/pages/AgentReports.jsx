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
  Legend,
} from "recharts";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { debounce } from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AgentReports = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    houseName: "",
    numberOfPlayers: { min: "", max: "" },
    betAmount: { min: "", max: "" },
    totalStake: { min: "", max: "" },
    cutAmountPercent: { min: "", max: "" },
    prize: { min: "", max: "" },
    systemEarnings: { min: "", max: "" },
    rechargeAmount: { min: "", max: "" },
    commission: { min: "", max: "" },
    winnerNumber: "",
    month: "",
    dateRange: { start: null, end: null },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showTopFilters, setShowTopFilters] = useState(false);
  const [showBottomFilters, setShowBottomFilters] = useState(false);
  const [visibleHouses, setVisibleHouses] = useState({});

  // Fetch agent stats from the API
  useEffect(() => {
    const fetchAgentStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const response = await api.get(`/api/stats/agent`, {
          params: {
            month: filters.month || undefined,
            startDate: filters.dateRange.start
              ? filters.dateRange.start.toISOString()
              : undefined,
            endDate: filters.dateRange.end
              ? filters.dateRange.end.toISOString()
              : undefined,
          },
        });

        setStats(response.data);
        setVisibleHouses(
          response.data.houses.reduce((acc, house) => {
            acc[house.houseName] = true;
            return acc;
          }, {}),
        );
        setError(null);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch agent stats";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentStats();
  }, [filters.month, filters.dateRange.start, filters.dateRange.end]);

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

  const handleHouseFilterChange = useCallback((e) => {
    setFilters((prev) => ({
      ...prev,
      houseName: e.target.value,
    }));
    setCurrentPage(1);
  }, []);

  const handleWinnerFilterChange = useCallback((e) => {
    setFilters((prev) => ({
      ...prev,
      winnerNumber: e.target.value,
    }));
    setCurrentPage(1);
  }, []);

  const handleMonthFilterChange = useCallback((e) => {
    setFilters((prev) => ({
      ...prev,
      month: e.target.value,
    }));
    setCurrentPage(1);
  }, []);

  const handleDateRangeChange = useCallback((dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
    }));
    setCurrentPage(1);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      houseName: "",
      numberOfPlayers: { min: "", max: "" },
      betAmount: { min: "", max: "" },
      totalStake: { min: "", max: "" },
      cutAmountPercent: { min: "", max: "" },
      prize: { min: "", max: "" },
      systemEarnings: { min: "", max: "" },
      rechargeAmount: { min: "", max: "" },
      commission: { min: "", max: "" },
      winnerNumber: "",
      month: "",
      dateRange: { start: null, end: null },
    });
    setCurrentPage(1);
  }, []);

  // Toggle house visibility in chart
  const toggleHouseVisibility = useCallback((houseName) => {
    setVisibleHouses((prev) => ({
      ...prev,
      [houseName]: !prev[houseName],
    }));
  }, []);

  // Memoized metrics
  const metrics = useMemo(() => {
    if (!stats || !stats.houses)
      return {
        totalHouses: 0,
        totalEarnings: 0,
        totalGames: 0,
        totalRechargeAmount: 0,
        totalCommissions: 0,
        totalTodayGames: 0,
        totalTodayRechargeAmount: 0,
        totalTodayCommissions: 0,
      };

    const filteredHouses = stats.houses.filter(
      (house) => !filters.houseName || house.houseName === filters.houseName,
    );

    return {
      totalHouses: filteredHouses.length,
      totalEarnings: filteredHouses.reduce(
        (sum, house) => sum + house.totalEarnings,
        0,
      ),
      totalGames: filteredHouses.reduce(
        (sum, house) => sum + house.totalGamesPlayed,
        0,
      ),
      totalRechargeAmount: filteredHouses.reduce(
        (sum, house) => sum + house.totalRechargeAmount,
        0,
      ),
      totalCommissions: filteredHouses.reduce(
        (sum, house) => sum + house.totalCommissions,
        0,
      ),
      totalTodayGames: filteredHouses.reduce(
        (sum, house) => sum + house.todayGames,
        0,
      ),
      totalTodayRechargeAmount: filteredHouses.reduce(
        (sum, house) => sum + house.todayRechargeAmount,
        0,
      ),
      totalTodayCommissions: filteredHouses.reduce(
        (sum, house) => sum + house.todayCommissions,
        0,
      ),
    };
  }, [stats, filters.houseName]);

  // Memoized recharge data
  const rechargeData = useMemo(() => {
    if (!stats || !stats.houses) return [];
    return stats.houses
      .filter(
        (house) => !filters.houseName || house.houseName === filters.houseName,
      )
      .flatMap((house) =>
        house.recharges
          .filter((recharge) => {
            const rechargeDate = new Date(recharge.createdAt);
            return (
              (!filters.dateRange.start ||
                rechargeDate >= filters.dateRange.start) &&
              (!filters.dateRange.end ||
                rechargeDate <= filters.dateRange.end) &&
              (!filters.rechargeAmount.min ||
                recharge.amount >= parseFloat(filters.rechargeAmount.min)) &&
              (!filters.rechargeAmount.max ||
                recharge.amount <= parseFloat(filters.rechargeAmount.max)) &&
              (!filters.commission.min ||
                recharge.commission >= parseFloat(filters.commission.min)) &&
              (!filters.commission.max ||
                recharge.commission <= parseFloat(filters.commission.max))
            );
          })
          .map((recharge) => ({
            "House Name": house.houseName,
            "Recharge Amount (ETB)": formatCurrency(recharge.amount),
            "Commission (ETB)": formatCurrency(recharge.commission),
            "Package Added (ETB)": formatCurrency(recharge.packageAdded),
            "Created At": formatDate(recharge.createdAt),
          })),
      );
  }, [
    stats,
    filters.houseName,
    filters.dateRange,
    filters.rechargeAmount,
    filters.commission,
  ]);

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredAndSortedGames.map((game) => ({
      "House Name": game.houseName,
      "Game Date & Time": formatDate(game.date),
      "Stake per Player (ETB)": formatCurrency(game.betAmount),
      "Number of Players": game.numberOfPlayers,
      "Total Stakes (ETB)": formatCurrency(game.totalStake),
      "House Commission (%)": game.cutAmountPercent,
      "Prize Amount (ETB)": formatCurrency(game.prize),
      "Winner Card ID": game.winnerNumber || "None",
      "House Profit (ETB)": formatCurrency(game.systemEarnings),
    }));

    const summaryData = [
      {
        "Total Houses": metrics.totalHouses,
        "Total Houses Profit (ETB)": formatCurrency(metrics.totalEarnings),
        "Total Games": metrics.totalGames,
        "Total Recharge Amount (ETB)": formatCurrency(
          metrics.totalRechargeAmount,
        ),
        "Total Commissions (ETB)": formatCurrency(metrics.totalCommissions),
        "Today's Games": metrics.totalTodayGames,
        "Today's Recharge Amount (ETB)": formatCurrency(
          metrics.totalTodayRechargeAmount,
        ),
        "Today's Commissions (ETB)": formatCurrency(
          metrics.totalTodayCommissions,
        ),
      },
    ];

    const csvSummary = Papa.unparse(summaryData);
    const csvGames = Papa.unparse(csvData);
    const csvRecharges = Papa.unparse(rechargeData);
    const csv = `Summary:\n${csvSummary}\n\nGames:\n${csvGames}\n\nRecharges:\n${csvRecharges}`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `agent_reports_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel
  const exportToExcel = () => {
    const gameData = filteredAndSortedGames.map((game) => ({
      "House Name": game.houseName,
      "Game Date & Time": formatDate(game.date),
      "Stake per Player (ETB)": formatCurrency(game.betAmount),
      "Number of Players": game.numberOfPlayers,
      "Total Stakes (ETB)": formatCurrency(game.totalStake),
      "House Commission (%)": game.cutAmountPercent,
      "Prize Amount (ETB)": formatCurrency(game.prize),
      "Winner Card ID": game.winnerNumber || "None",
      "House Profit (ETB)": formatCurrency(game.systemEarnings),
    }));

    const summaryData = [
      {
        "Total Houses": metrics.totalHouses,
        "Total Houses Profit (ETB)": formatCurrency(metrics.totalEarnings),
        "Total Games": metrics.totalGames,
        "Total Recharge Amount (ETB)": formatCurrency(
          metrics.totalRechargeAmount,
        ),
        "Total Commissions (ETB)": formatCurrency(metrics.totalCommissions),
        "Today's Games": metrics.totalTodayGames,
        "Today's Recharge Amount (ETB)": formatCurrency(
          metrics.totalTodayRechargeAmount,
        ),
        "Today's Commissions (ETB)": formatCurrency(
          metrics.totalTodayCommissions,
        ),
      },
    ];

    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const gameSheet = XLSX.utils.json_to_sheet(gameData);
    const rechargeSheet = XLSX.utils.json_to_sheet(rechargeData);

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, gameSheet, "Games");
    XLSX.utils.book_append_sheet(workbook, rechargeSheet, "Recharges");

    XLSX.writeFile(
      workbook,
      `agent_reports_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Agent Reports", 20, 10);

    // Summary Table
    doc.text("Summary", 20, 20);
    autoTable(doc, {
      head: [
        [
          "Total Houses",
          "Total Houses Profit (ETB)",
          "Total Games",
          "Total Recharge Amount (ETB)",
          "Total Commissions (ETB)",
          "Today's Games",
          "Today's Recharge Amount (ETB)",
          "Today's Commissions (ETB)",
        ],
      ],
      body: [
        [
          metrics.totalHouses,
          formatCurrency(metrics.totalEarnings),
          metrics.totalGames,
          formatCurrency(metrics.totalRechargeAmount),
          formatCurrency(metrics.totalCommissions),
          metrics.totalTodayGames,
          formatCurrency(metrics.totalTodayRechargeAmount),
          formatCurrency(metrics.totalTodayCommissions),
        ],
      ],
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] },
    });

    // Games Table
    let finalY = doc.lastAutoTable.finalY || 30;
    doc.text("Games", 20, finalY + 10);
    autoTable(doc, {
      head: [
        [
          "House Name",
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
        game.houseName,
        formatDate(game.date),
        formatCurrency(game.betAmount),
        game.numberOfPlayers,
        formatCurrency(game.totalStake),
        game.cutAmountPercent,
        formatCurrency(game.prize),
        game.winnerNumber || "None",
        formatCurrency(game.systemEarnings),
      ]),
      startY: finalY + 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] },
    });

    // Recharges Table
    finalY = doc.lastAutoTable.finalY || finalY + 20;
    doc.text("Recharges", 20, finalY + 10);
    autoTable(doc, {
      head: [
        [
          "House Name",
          "Recharge Amount (ETB)",
          "Commission (ETB)",
          "Package Added (ETB)",
          "Created At",
        ],
      ],
      body: rechargeData.map((recharge) => [
        recharge["House Name"],
        recharge["Recharge Amount (ETB)"],
        recharge["Commission (ETB)"],
        recharge["Package Added (ETB)"],
        recharge["Created At"],
      ]),
      startY: finalY + 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save(`agent_reports_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Filtered and sorted games
  const filteredAndSortedGames = useMemo(() => {
    if (!stats || !stats.houses) return [];

    let games = stats.houses
      .filter(
        (house) => !filters.houseName || house.houseName === filters.houseName,
      )
      .flatMap((house) =>
        house.gameHistory
          .filter((game) => {
            const gameDate = new Date(game.date);
            return (
              (!filters.dateRange.start ||
                gameDate >= filters.dateRange.start) &&
              (!filters.dateRange.end || gameDate <= filters.dateRange.end)
            );
          })
          .map((game) => ({
            ...game,
            houseName: house.houseName,
          })),
      );

    // Apply numeric and winner filters
    games = games.filter((game) => {
      const players = game.numberOfPlayers;
      const bet = game.betAmount;
      const stake = game.totalStake;
      const cut = game.cutAmountPercent;
      const prize = game.prize;
      const earnings = game.systemEarnings;
      const winner = game.winnerNumber;

      const {
        numberOfPlayers,
        betAmount,
        totalStake,
        cutAmountPercent,
        prize: prizeFilter,
        systemEarnings,
        winnerNumber,
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
        (!winnerNumber || (winnerNumber === "hasWinner" ? winner : !winner))
      );
    });

    // Apply sorting
    games.sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === "asc" ? 1 : -1;

      if (key === "date") {
        return direction * (new Date(a.date) - new Date(b.date));
      } else if (key === "houseName") {
        return direction * a.houseName.localeCompare(b.houseName);
      } else if (key === "winnerNumber") {
        const valA = a.winnerNumber || "";
        const valB = b.winnerNumber || "";
        return direction * valA.localeCompare(valB);
      } else {
        return direction * ((a[key] || 0) - (b[key] || 0));
      }
    });

    return games;
  }, [stats, sortConfig, filters]);

  // Pagination
  const totalItems = filteredAndSortedGames.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedGames = filteredAndSortedGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const handleItemsPerPageChange = useCallback((e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  }, []);

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
              ? "bg-red-500 text-white"
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

  // Chart data with per-house commissions
  const chartData = useMemo(() => {
    if (!stats || !stats.houses) return [];

    const dates = new Set();
    const houseCommissions = {};

    stats.houses
      .filter(
        (house) => !filters.houseName || house.houseName === filters.houseName,
      )
      .forEach((house) => {
        house.recharges
          .filter((recharge) => {
            const rechargeDate = new Date(recharge.createdAt);
            return (
              (!filters.dateRange.start ||
                rechargeDate >= filters.dateRange.start) &&
              (!filters.dateRange.end || rechargeDate <= filters.dateRange.end)
            );
          })
          .forEach((recharge) => {
            const date = new Date(recharge.createdAt).toLocaleDateString(
              "en-ET",
              {
                day: "numeric",
                month: "short",
              },
            );
            dates.add(date);
            houseCommissions[house.houseName] =
              houseCommissions[house.houseName] || {};
            houseCommissions[house.houseName][date] =
              (houseCommissions[house.houseName][date] || 0) +
              recharge.commission;
          });
      });

    return Array.from(dates)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => {
        const entry = { date };
        stats.houses.forEach((house) => {
          entry[house.houseName] =
            houseCommissions[house.houseName]?.[date] || 0;
        });
        return entry;
      });
  }, [stats, filters.houseName, filters.dateRange]);

  // House colors for chart
  const houseColors = useMemo(() => {
    if (!stats || !stats.houses) return {};
    const colors = [
      "#dc2626",
      "#2563eb",
      "#16a34a",
      "#d97706",
      "#9333ea",
      "#db2777",
      "#059669",
      "#7c3aed",
      "#b91c1c",
      "#1d4ed8",
    ];
    return stats.houses.reduce((acc, house, index) => {
      acc[house.houseName] = colors[index % colors.length];
      return acc;
    }, {});
  }, [stats]);

  return (
    <div className="w-full p-4">
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}

      {error && (
        <p className="text-red-500 bg-red-900/50 p-3 rounded w-full mb-4">
          Error: {error}
        </p>
      )}

      {stats && !isLoading && (
        <div className="w-full">
          {/* Top Filters (House, Date Range, Month) */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowTopFilters(!showTopFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <FaFilter /> {showTopFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {showTopFilters && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Main Filters
                </h2>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <FaTimes /> Reset Filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    House
                  </label>
                  <select
                    value={filters.houseName}
                    onChange={handleHouseFilterChange}
                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Houses</option>
                    {stats.houses.map((house) => (
                      <option key={house.houseName} value={house.houseName}>
                        {house.houseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Date Range
                  </label>
                  <DatePicker
                    selectsRange
                    startDate={filters.dateRange.start}
                    endDate={filters.dateRange.end}
                    onChange={handleDateRangeChange}
                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-red-500"
                    placeholderText="Select date range"
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Month
                  </label>
                  <select
                    value={filters.month}
                    onChange={handleMonthFilterChange}
                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-red-500"
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

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-600 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-gray-300">
                Total Houses
              </h2>
              <p className="text-2xl text-red-400">{metrics.totalHouses}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-gray-300">
                Total Commissions (ETB)
              </h2>
              <p className="text-2xl text-yellow-400">
                {formatCurrency(metrics.totalCommissions)}
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-600 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-gray-300">
                Total Games
              </h2>
              <p className="text-2xl text-green-400">{metrics.totalGames}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-gray-300">
                Total Recharge Amount (ETB)
              </h2>
              <p className="text-2xl text-blue-400">
                {formatCurrency(metrics.totalRechargeAmount)}
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-gray-300">
                Today's Games
              </h2>
              <p className="text-2xl text-purple-400">
                {metrics.totalTodayGames}
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-pink-600 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-gray-300">
                Today's Commissions (ETB)
              </h2>
              <p className="text-2xl text-pink-400">
                {formatCurrency(metrics.totalTodayCommissions)}
              </p>
            </div>
          </div>

          {/* Commissions Chart */}
          <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Commissions Over Time by House
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                  formatter={(value, name) => [
                    `${formatCurrency(value)} ETB`,
                    name,
                  ]}
                />
                <Legend
                  onClick={(e) => toggleHouseVisibility(e.dataKey)}
                  formatter={(value) => (
                    <span
                      style={{ color: visibleHouses[value] ? "#fff" : "#666" }}
                    >
                      {value}
                    </span>
                  )}
                />
                {stats.houses
                  .filter(
                    (house) =>
                      !filters.houseName ||
                      house.houseName === filters.houseName,
                  )
                  .map((house) => (
                    <Line
                      key={house.houseName}
                      type="monotone"
                      dataKey={house.houseName}
                      stroke={houseColors[house.houseName]}
                      strokeWidth={2}
                      dot={{ fill: houseColors[house.houseName], r: 4 }}
                      hide={!visibleHouses[house.houseName]}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Filters Toggle and Export Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <button
              onClick={() => setShowBottomFilters(!showBottomFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <FaFilter /> {showBottomFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                <FaDownload /> CSV
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <FaDownload /> Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <FaDownload /> PDF
              </button>
            </div>
          </div>

          {/* Bottom Filters */}
          {showBottomFilters && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Additional Filters
                </h2>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <FaTimes /> Reset Filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
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
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Recharge Amount (ETB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.rechargeAmount.min}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "rechargeAmount",
                          "min",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.rechargeAmount.max}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "rechargeAmount",
                          "max",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Commission (ETB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.commission.min}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "commission",
                          "min",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.commission.max}
                      onChange={(e) =>
                        debouncedHandleFilterChange(
                          e.target.value,
                          "commission",
                          "max",
                        )
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Winner Card ID
                  </label>
                  <select
                    value={filters.winnerNumber}
                    onChange={handleWinnerFilterChange}
                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-2 focus:ring-red-500"
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
            <h2 className="text-lg font-semibold p-4 text-white">
              Game History
            </h2>
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
                        { label: "House Name", key: "houseName" },
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
                        >
                          <div className="flex items-center gap-1 text-gray-300">
                            {label}
                            {sortConfig.key === key ? (
                              sortConfig.direction === "asc" ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort className="text-gray-400" />
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
                        <td className="p-3 text-white">{game.houseName}</td>
                        <td className="p-3 text-white">
                          {formatDate(game.date)}
                        </td>
                        <td className="p-3 text-white">
                          {formatCurrency(game.betAmount)}
                        </td>
                        <td className="p-3 text-white">
                          {game.numberOfPlayers}
                        </td>
                        <td className="p-3 text-white">
                          {formatCurrency(game.totalStake)}
                        </td>
                        <td className="p-3 text-white">
                          {game.cutAmountPercent}%
                        </td>
                        <td className="p-3 text-white">
                          {formatCurrency(game.prize)}
                        </td>
                        <td className="p-3 text-white">
                          {game.winnerNumber || "None"}
                        </td>
                        <td className="p-3 text-white">
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

          {/* Recharges Table */}
          <div className="bg-gray-800 rounded-lg shadow overflow-x-auto mt-8">
            <h2 className="text-lg font-semibold p-4 text-white">
              Recharge History
            </h2>
            {rechargeData.length === 0 ? (
              <p className="p-4 text-gray-400">
                No recharges match the current filters.
              </p>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-700">
                      {[
                        "House Name",
                        "Recharge Amount (ETB)",
                        "Commission (ETB)",
                        "Package Added (ETB)",
                        "Created At",
                      ].map((label) => (
                        <th key={label} className="p-3 text-gray-300">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rechargeData.map((recharge, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-700 hover:bg-gray-700"
                      >
                        <td className="p-3 text-white">
                          {recharge["House Name"]}
                        </td>
                        <td className="p-3 text-white">
                          {recharge["Recharge Amount (ETB)"]}
                        </td>
                        <td className="p-3 text-white">
                          {recharge["Commission (ETB)"]}
                        </td>
                        <td className="p-3 text-white">
                          {recharge["Package Added (ETB)"]}
                        </td>
                        <td className="p-3 text-white">
                          {recharge["Created At"]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentReports;
