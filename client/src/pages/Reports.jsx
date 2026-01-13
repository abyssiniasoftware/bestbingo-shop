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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchDailyStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("የማረጋገጫ ቶከን አልተገኘም። እባክዎ ይግቡ");
        }

        const response = await api.get(
          `/api/stats/daily`,
          
        );

        setStats(response.data);
        setError(null);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "ዕለታዊ ሪፖርቶችን ማግኘት አልተቻለም";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyStats();
  }, []);

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
    currentPage * itemsPerPage
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
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-700 rounded text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          ቀዳሚ
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-700 rounded text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          ቀጣይ
        </button>
        <div className="flex items-center gap-2">
          <label className="text-gray-300">ረድፎች በገጽ:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-1 bg-gray-700 rounded text-white border border-gray-600"
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 w-full">
        <FaChartLine /> ዕለታዊ ሪፖርቶች
      </h1>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}

      {error && (
        <p className="text-red-500 bg-red-900/50 p-3 rounded w-full">
          ስህተት: {error}
        </p>
      )}

      {stats && !isLoading && (
        <div className="w-full">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold">ቀሪ ሒሳብ (ብር)</h2>
              <p className="text-2xl text-green-400">
                {formatCurrency(stats.packageBalance)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold">ዕለታዊ አጠቃላይ ትርፍ (ብር)</h2>
              <p className="text-2xl text-green-400">
                {formatCurrency(stats.totalDailyEarnings)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold">አጠቃላይ የተጫወቱ ጨዋታዎች</h2>
              <p className="text-2xl text-blue-400">{stats.totalGamesPlayed}</p>
            </div>
          </div>

          {/* Filters Toggle Button */}
          <div className="mb-4 w-full">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaFilter /> {showFilters ? "ፊልተሮችን ደብቅ" : "ፊልተሮችን አሳይ"}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">ፊልተሮች</h2>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <FaTimes /> ፊልተሮችን ዳግም አስጀምር
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    የተጫዋቾች ብዛት
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="ዝቅተኛ"
                      value={filters.numberOfPlayers.min}
                      onChange={(e) =>
                        handleFilterChange(e, "numberOfPlayers", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="ከፍተኛ"
                      value={filters.numberOfPlayers.max}
                      onChange={(e) =>
                        handleFilterChange(e, "numberOfPlayers", "max")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ውርርድ በተጫዋች (ብር)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="ዝቅተኛ"
                      value={filters.betAmount.min}
                      onChange={(e) =>
                        handleFilterChange(e, "betAmount", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="ከፍተኛ"
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
                    አጠቃላይ ውርርድ (ብር)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="ዝቅተኛ"
                      value={filters.totalStake.min}
                      onChange={(e) =>
                        handleFilterChange(e, "totalStake", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="ከፍተኛ"
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
                    የቤት ኮሚሽን (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="ዝቅተኛ"
                      value={filters.cutAmountPercent.min}
                      onChange={(e) =>
                        handleFilterChange(e, "cutAmountPercent", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="ከፍተኛ"
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
                    የሽልማት መጠን (ብር)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="ዝቅተኛ"
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
                    የቤት ትርፍ (ብር)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="ዝቅተኛ"
                      value={filters.systemEarnings.min}
                      onChange={(e) =>
                        handleFilterChange(e, "systemEarnings", "min")
                      }
                      className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="ከፍተኛ"
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
                    የደረሰኝ ካርድ
                  </label>
                  <select
                    value={filters.winnerNumber}
                    onChange={handleWinnerFilterChange}
                    className="w-full p-2 bg-gray-700 rounded text-white"
                  >
                    <option value="">ሁሉም</option>
                    <option value="hasWinner">ደረሰኝ አለ</option>
                    <option value="noWinner">ደረሰኝ የለም</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Game History Table */}
          <div className="bg-gray-800 rounded-lg shadow overflow-x-auto w-full">
            <h2 className="text-lg font-semibold p-4">የጨዋታ ታሪክ</h2>
            {filteredAndSortedGames.length === 0 ? (
              <p className="p-4 text-gray-400">
                ምንም ጨዋታዎች ከአሁኑ ፊልተሮች ጋር አይመሳሰሉም።
              </p>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-700">
                      {[
                        { label: "የጨዋታ ቀን እና ሰዓት", key: "date" },
                        { label: "ውርርድ በተጫዋች (ብር)", key: "betAmount" },
                        { label: "የተጫዋቾች ብዛት", key: "numberOfPlayers" },
                        { label: "አጠቃላይ ውርርድ (ብር)", key: "totalStake" },
                        { label: "የቤት ኮሚሽን (%)", key: "cutAmountPercent" },
                        { label: "የሽልማት መጠን (ብር)", key: "prize" },
                        { label: "የደረሰኝ ካርድ", key: "winnerNumber" },
                        { label: "የቤት ትርፍ (ብር)", key: "systemEarnings" },
                      ].map(({ label, key }) => (
                        <th
                          key={key}
                          className="p-3 cursor-pointer hover:bg-gray-600"
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
                        <td className="p-3">{game.winnerNumber || "የለም"}</td>
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
