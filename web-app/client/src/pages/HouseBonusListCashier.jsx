import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const HouseBonusListCashier = () => {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("dateIssued");
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBonuses = async () => {
      setLoading(true);
      try {
        const houseId = sessionStorage.getItem("houseId");
        if (!houseId) {
          throw new Error("House ID not found in local storage");
        }
        const response = await api.get(`/api/game/house/${houseId}/bonuses`);
        setBonuses(response.data.bonuses || []);
        setError(null);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch bonuses";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchBonuses();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedBonuses = [...bonuses].sort((a, b) => {
    const fieldA = a[sortField] || a.gameId?.[sortField] || "";
    const fieldB = b[sortField] || b.gameId?.[sortField] || "";
    if (sortOrder === "asc") {
      return fieldA > fieldB ? 1 : -1;
    }
    return fieldA < fieldB ? 1 : -1;
  });

  const totalPages = Math.ceil(bonuses.length / itemsPerPage);
  const paginatedBonuses = sortedBonuses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold mb-6 text-[#2980b9]">
        Bonus Report
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
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}
      {error && <div className="text-red-500 bg-red-50 p-3 rounded border border-red-200 mb-4">{error}</div>}
      {!loading && !error && (
        <>
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#2980b9] text-white border-b border-[#2471a3]">
                  <th
                    className="p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("cashierId")}
                  >
                    <div className="flex items-center gap-1">
                      Cashier Name
                      {sortField === "cashierId" ? (
                        sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSort className="text-gray-300" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("gameId")}
                  >
                    <div className="flex items-center gap-1">
                      Game No.
                      {sortField === "gameId" ? (
                        sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSort className="text-gray-300" />
                      )}
                    </div>
                  </th>
                  <th className="p-3">Winner Card</th>
                  <th
                    className="p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("prize")}
                  >
                    <div className="flex items-center gap-1">
                      Prize
                      {sortField === "prize" ? (
                        sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSort className="text-gray-300" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("bonusAmount")}
                  >
                    <div className="flex items-center gap-1">
                      Bonus Amount
                      {sortField === "bonusAmount" ? (
                        sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSort className="text-gray-300" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("dateIssued")}
                  >
                    <div className="flex items-center gap-1">
                      Date Issued
                      {sortField === "dateIssued" ? (
                        sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSort className="text-gray-300" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBonuses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">No bonuses found.</td>
                  </tr>
                ) : (
                  paginatedBonuses.map((bonus) => (
                    <tr key={bonus._id} className="border-t border-gray-100 hover:bg-gray-50 text-gray-700">
                      <td className="p-3">
                        {bonus.cashierId?.username || "N/A"}
                      </td>
                      <td className="p-3 font-medium">{bonus.gameId?.gameId || "N/A"}</td>
                      <td className="p-3">
                        {bonus.gameId?.winnerCardId || "N/A"}
                      </td>
                      <td className="p-3 text-red-600 font-semibold font-mono">
                        {bonus.gameId?.prize
                          ? `${bonus.gameId.prize} ETB`
                          : "N/A"}
                      </td>
                      <td className="p-3 text-green-600 font-bold font-mono">{bonus.bonusAmount} ETB</td>
                      <td className="p-3 text-gray-500 text-sm">{formatDate(bonus.dateIssued)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-6 px-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600 font-medium">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HouseBonusListCashier;
