import React, { useState, useEffect, useMemo } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import {
  FaChartLine,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

const Reports = () => {
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
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchDailyStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in");
        }

        const response = await api.get(`/api/stats/daily`, {
          params: { date: selectedDate },
        });

        setStats(response.data);
        setError(null);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch daily reports";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyStats();
  }, [selectedDate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (e, field, type) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      [field]: { ...prev[field], [type]: value },
    }));
    setCurrentPage(1);
  };

  const handleWinnerFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      winnerNumber: e.target.value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      numberOfPlayers: { min: "", max: "" },
      betAmount: { min: "", max: "" },
      totalStake: { min: "", max: "" },
      cutAmountPercent: { min: "", max: "" },
      prize: { min: "", max: "" },
      systemEarnings: { min: "", max: "" },
      winnerNumber: "",
    });
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const filteredAndSortedGames = useMemo(() => {
    if (!stats || !stats.gameHistory) return [];

    let filtered = [...stats.gameHistory];

    filtered = filtered.filter((game) => {
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
          className={`px-3 py-1 rounded ${currentPage === i
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap pb-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
        <div className="flex items-center gap-2">
          <label className="text-gray-600">Rows per page:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-1 bg-white rounded text-gray-800 border border-gray-300"
          >
            {[5, 10, 25, 50, 75, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <FaChartLine /> Daily Reports
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Select Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
          />
        </div>
      </div>

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
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-600">Package Balance (Birr)</h2>
              <p className="text-2xl text-green-600 font-bold">
                {formatCurrency(stats.packageBalance)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-600">Daily Total Profit (Birr)</h2>
              <p className="text-2xl text-green-600 font-bold">
                {formatCurrency(stats.totalDailyEarnings)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-600">Total Games Played</h2>
              <p className="text-2xl text-blue-600 font-bold">{stats.totalGamesPlayed}</p>
            </div>
          </div>

          {/* Filters Toggle Button */}
          <div className="mb-4 w-full">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <FaTimes /> Reset Filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Number of Players
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.numberOfPlayers.min}
                      onChange={(e) =>
                        handleFilterChange(e, "numberOfPlayers", "min")
                      }
                      className="w-full p-2 bg-gray-50 rounded border border-gray-300 text-gray-800 placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.numberOfPlayers.max}
                      onChange={(e) =>
                        handleFilterChange(e, "numberOfPlayers", "max")
                      }
                      className="w-full p-2 bg-gray-50 rounded border border-gray-300 text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bet per Player (Birr)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.betAmount.min}
                      onChange={(e) =>
                        handleFilterChange(e, "betAmount", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.betAmount.max}
                      onChange={(e) =>
                        handleFilterChange(e, "betAmount", "max")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Stake (Birr)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.totalStake.min}
                      onChange={(e) =>
                        handleFilterChange(e, "totalStake", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.totalStake.max}
                      onChange={(e) =>
                        handleFilterChange(e, "totalStake", "max")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
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
                        handleFilterChange(e, "cutAmountPercent", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.cutAmountPercent.max}
                      onChange={(e) =>
                        handleFilterChange(e, "cutAmountPercent", "max")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prize Amount (Birr)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.prize.min}
                      onChange={(e) => handleFilterChange(e, "prize", "min")}
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="ከፍተኛ"
                      value={filters.prize.max}
                      onChange={(e) => handleFilterChange(e, "prize", "max")}
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    House Profit (Birr)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.systemEarnings.min}
                      onChange={(e) =>
                        handleFilterChange(e, "systemEarnings", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.systemEarnings.max}
                      onChange={(e) =>
                        handleFilterChange(e, "systemEarnings", "max")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Winner Card
                  </label>
                  <select
                    value={filters.winnerNumber}
                    onChange={handleWinnerFilterChange}
                    className="w-full p-2 bg-gray-700 rounded text-white"
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
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto w-full">
            <h2 className="text-lg font-semibold p-4 text-gray-800 border-b border-gray-100">Game History</h2>
            {filteredAndSortedGames.length === 0 ? (
              <p className="p-4 text-gray-500">
                No games match the current filters.
              </p>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 border-b border-gray-100">
                      {[
                        { label: "Round #", key: "gameId" },
                        { label: "Game Date & Time", key: "date" },
                        { label: "Stake per Player (Birr)", key: "betAmount" },
                        { label: "Number of Players", key: "numberOfPlayers" },
                        { label: "Total Stake (Birr)", key: "totalStake" },
                        { label: "House Commission (%)", key: "cutAmountPercent" },
                        { label: "Prize Amount (Birr)", key: "prize" },
                        { label: "Winner Card", key: "winnerNumber" },
                        { label: "House Profit (Birr)", key: "systemEarnings" },
                      ].map(({ label, key }) => (
                        <th
                          key={key}
                          className="p-3 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort(key)}
                        >
                          <div className="flex items-center gap-1">
                            {label}
                            {sortConfig.key === key ? (
                              sortConfig.direction === "asc" ? (
                                <FaSortUp />
                              ) : (
                                <FaSortDown />
                              )
                            ) : (
                              <FaSort className="text-gray-300" />
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
                        className="border-t border-gray-100 hover:bg-gray-50 text-gray-700"
                      >
                        <td className="p-3">{game.gameId}</td>
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
        </div>
      )}
    </div>
  );
};

export default Reports;
