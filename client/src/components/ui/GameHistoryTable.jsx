import React, { useState, useMemo, useCallback } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const GameHistoryTable = ({
  filters,
  stats,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

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

  const handleSort = useCallback(
    (key) => {
      setSortConfig((prev) => {
        if (prev.key === key && prev.direction === "asc") {
          return { key, direction: "desc" };
        }
        return { key, direction: "asc" };
      });
      setCurrentPage(1);
    },
    [setCurrentPage],
  );

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
    [totalPages, setCurrentPage],
  );

  const handleItemsPerPageChange = useCallback(
    (e) => {
      setItemsPerPage(parseInt(e.target.value));
      setCurrentPage(1);
    },
    [setItemsPerPage, setCurrentPage],
  );

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

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
      <h2 className="text-lg font-semibold p-4 text-white">Game History</h2>
      {filteredAndSortedGames.length === 0 ? (
        <p className="p-4 text-gray-400">No games match the current filters.</p>
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
                  { label: "Hose Commission (%)", key: "cutAmountPercent" },
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
                  <td className="p-3 text-white">{formatDate(game.date)}</td>
                  <td className="p-3 text-white">
                    {formatCurrency(game.betAmount)}
                  </td>
                  <td className="p-3 text-white">{game.numberOfPlayers}</td>
                  <td className="p-3 text-white">
                    {formatCurrency(game.totalStake)}
                  </td>
                  <td className="p-3 text-white">{game.cutAmountPercent}%</td>
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
  );
};

export default GameHistoryTable;
