import React, { useCallback, useMemo } from "react";
import { FaFilter, FaTimes, FaDownload } from "react-icons/fa";
import { debounce } from "lodash";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdditionalFilters = ({
  filters,
  setFilters,
  showBottomFilters,
  setShowBottomFilters,
  setCurrentPage,
  stats,
  currentPage,
  itemsPerPage,
  setItemsPerPage,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-ET", {
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

  const handleFilterChange = useCallback(
    (value, field, type) => {
      setFilters((prev) => ({
        ...prev,
        [field]: { ...prev[field], [type]: value },
      }));
      setCurrentPage(1);
    },
    [setFilters, setCurrentPage]
  );

  const debouncedHandleFilterChange = useMemo(
    () => debounce(handleFilterChange, 300),
    [handleFilterChange]
  );

  const handleWinnerFilterChange = useCallback(
    (e) => {
      setFilters((prev) => ({
        ...prev,
        winnerNumber: e.target.value,
      }));
      setCurrentPage(1);
    },
    [setFilters, setCurrentPage]
  );

  const resetFilters = useCallback(() => {
    setFilters({
      houseName: "",
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
  }, [setFilters, setCurrentPage]);

  const filteredAndSortedGames = useMemo(() => {
    if (!stats || !stats.houses) return [];

    let games = stats.houses
      .filter(
        (house) => !filters.houseName || house.houseName === filters.houseName
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
          }))
      );

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

    return games;
  }, [stats, filters]);

  const metrics = useMemo(() => {
    if (!stats || !stats.houses)
      return {
        totalDeposits: 0,
        todayGames: 0,
        todayDeposits: 0,
        totalEarnings: 0,
        totalGames: 0,
        totalHouses: 0,
      };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const filteredHouses = stats.houses.filter(
      (house) => !filters.houseName || house.houseName === filters.houseName
    );

    const totalDeposits = filteredHouses
      .flatMap((house) => house.recharges)
      .filter((recharge) => {
        const rechargeDate = new Date(recharge.createdAt);
        return (
          (!filters.dateRange.start ||
            rechargeDate >= filters.dateRange.start) &&
          (!filters.dateRange.end || rechargeDate <= filters.dateRange.end)
        );
      })
      .reduce((sum, recharge) => sum + recharge.amount, 0);

    const todayGames = filteredHouses
      .flatMap((house) => house.gameHistory)
      .filter((game) => {
        const gameDate = new Date(game.date);
        return gameDate >= today && gameDate < tomorrow;
      }).length;

    const todayDeposits = filteredHouses
      .flatMap((house) => house.recharges)
      .filter((recharge) => {
        const rechargeDate = new Date(recharge.createdAt);
        return rechargeDate >= today && rechargeDate < tomorrow;
      })
      .reduce((sum, recharge) => sum + recharge.amount, 0);

    const totalEarnings = filteredHouses
      .flatMap((house) => house.gameHistory)
      .filter((game) => {
        const gameDate = new Date(game.date);
        return (
          (!filters.dateRange.start || gameDate >= filters.dateRange.start) &&
          (!filters.dateRange.end || gameDate <= filters.dateRange.end)
        );
      })
      .reduce((sum, game) => sum + game.systemEarnings, 0);

    const totalGames = filteredHouses
      .flatMap((house) => house.gameHistory)
      .filter((game) => {
        const gameDate = new Date(game.date);
        return (
          (!filters.dateRange.start || gameDate >= filters.dateRange.start) &&
          (!filters.dateRange.end || gameDate <= filters.dateRange.end)
        );
      }).length;

    return {
      totalDeposits,
      todayGames,
      todayDeposits,
      totalEarnings,
      totalGames,
      totalHouses: filteredHouses.length,
    };
  }, [stats, filters.houseName, filters.dateRange]);

  const rechargeData = useMemo(() => {
    if (!stats || !stats.houses) return [];
    return stats.houses
      .filter(
        (house) => !filters.houseName || house.houseName === filters.houseName
      )
      .flatMap((house) =>
        house.recharges
          .filter((recharge) => {
            const rechargeDate = new Date(recharge.createdAt);
            return (
              (!filters.dateRange.start ||
                rechargeDate >= filters.dateRange.start) &&
              (!filters.dateRange.end || rechargeDate <= filters.dateRange.end)
            );
          })
          .map((recharge) => ({
            "House Name": house.houseName,
            "Recharge Amount (ETB)": formatCurrency(recharge.amount),
            "Package Added (ETB)": formatCurrency(recharge.packageAdded),
            "Created At": formatDate(recharge.createdAt),
          }))
      );
  }, [stats, filters.houseName, filters.dateRange]);

  const exportToCSV = () => {
    const csvData = filteredAndSortedGames.map((game) => ({
      "House Name": game.houseName,
      "Game Date & Time": formatDate(game.date),
      "Stake per Player (ETB)": formatCurrency(game.betAmount),
      "Number of Players": game.numberOfPlayers,
      "Total Stakes (ETB)": formatCurrency(game.totalStake),
      "Hose Commission (%)": game.cutAmountPercent,
      "Prize Amount (ETB)": formatCurrency(game.prize),
      "Winner Card ID": game.winnerNumber || "None",
      "hose profit (ETB)": formatCurrency(game.systemEarnings),
    }));

    const summaryData = [
      {
        "Total Houses": metrics.totalHouses,
        "Total Houses Profit (ETB)": formatCurrency(metrics.totalEarnings),
        "Total Games": metrics.totalGames,
        "Total Deposits (ETB)": formatCurrency(metrics.totalDeposits),
        "Today's Games": metrics.todayGames,
        "Today's Deposits (ETB)": formatCurrency(metrics.todayDeposits),
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
      `super_admin_reports_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const gameData = filteredAndSortedGames.map((game) => ({
      "House Name": game.houseName,
      "Game Date & Time": formatDate(game.date),
      "Stake per Player (ETB)": formatCurrency(game.betAmount),
      "Number of Players": game.numberOfPlayers,
      "Total Stakes (ETB)": formatCurrency(game.totalStake),
      "Hose Commission (%)": game.cutAmountPercent,
      "Prize Amount (ETB)": formatCurrency(game.prize),
      "Winner Card ID": game.winnerNumber || "None",
      "hose profit (ETB)": formatCurrency(game.systemEarnings),
    }));

    const summaryData = [
      {
        "Total Houses": metrics.totalHouses,
        "Total Houses Profit (ETB)": formatCurrency(metrics.totalEarnings),
        "Total Games": metrics.totalGames,
        "Total Deposits (ETB)": formatCurrency(metrics.totalDeposits),
        "Today's Games": metrics.todayGames,
        "Today's Deposits (ETB)": formatCurrency(metrics.todayDeposits),
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
      `super_admin_reports_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Super Admin Reports", 20, 10);

    doc.text("Summary", 20, 20);
    autoTable(doc, {
      head: [
        [
          "Total Houses",
          "Total Houses Profit (ETB)",
          "Total Games",
          "Total Deposits (ETB)",
          "Today's Games",
          "Today's Deposits (ETB)",
        ],
      ],
      body: [
        [
          metrics.totalHouses,
          formatCurrency(metrics.totalEarnings),
          metrics.totalGames,
          formatCurrency(metrics.totalDeposits),
          metrics.todayGames,
          formatCurrency(metrics.todayDeposits),
        ],
      ],
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] },
    });

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
          "Hose Commission (%)",
          "Prize Amount (ETB)",
          "Winner Card ID",
          "hose profit (ETB)",
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

    finalY = doc.lastAutoTable.finalY || finalY + 20;
    doc.text("Recharges", 20, finalY + 10);
    autoTable(doc, {
      head: [
        [
          "House Name",
          "Recharge Amount (ETB)",
          "Package Added (ETB)",
          "Created At",
        ],
      ],
      body: rechargeData.map((recharge) => [
        recharge["House Name"],
        recharge["Recharge Amount (ETB)"],
        recharge["Package Added (ETB)"],
        recharge["Created At"],
      ]),
      startY: finalY + 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save(
      `super_admin_reports_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  const handleItemsPerPageChange = useCallback(
    (e) => {
      setItemsPerPage(parseInt(e.target.value));
      setCurrentPage(1);
    },
    [setItemsPerPage, setCurrentPage]
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <button
          onClick={() => setShowBottomFilters(!showBottomFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
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

      {showBottomFilters && (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              Additional Filters
            </h2>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
                      "min"
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
                      "max"
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
                      "min"
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
                      "max"
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
                      "min"
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
                      "max"
                    )
                  }
                  className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Hose Commission (%)
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
                      "min"
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
                      "max"
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
                    debouncedHandleFilterChange(e.target.value, "prize", "min")
                  }
                  className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.prize.max}
                  onChange={(e) =>
                    debouncedHandleFilterChange(e.target.value, "prize", "max")
                  }
                  className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Hoses Profit (ETB)
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
                      "min"
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
                      "max"
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
    </>
  );
};

export default AdditionalFilters;
