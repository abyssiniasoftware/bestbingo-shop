import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const HouseBonusList = () => {
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">House Bonuses</h2>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg">
              <thead>
                <tr className="text-left text-gray-400">
                  {/* <th className="p-3 cursor-pointer" onClick={() => handleSort('_id')}>
                    Bonus ID {sortField === '_id' && (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </th> */}
                  <th
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort("cashierId")}
                  >
                    Cashier Name{" "}
                    {sortField === "cashierId" &&
                      (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                  <th
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort("gameId")}
                  >
                    Game No.
                    {sortField === "gameId" &&
                      (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                  <th className="p-3">Winner Card</th>
                  <th
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort("prize")}
                  >
                    Prize{" "}
                    {sortField === "prize" &&
                      (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                  <th
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort("bonusAmount")}
                  >
                    Bonus Amount{" "}
                    {sortField === "bonusAmount" &&
                      (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                  <th
                    className="p-3 cursor-pointer"
                    onClick={() => handleSort("dateIssued")}
                  >
                    Date Issued{" "}
                    {sortField === "dateIssued" &&
                      (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBonuses.map((bonus) => (
                  <tr key={bonus._id} className="border-t border-gray-700">
                    {/* <td className="p-3">{bonus._id}</td> */}
                    <td className="p-3">
                      {bonus.cashierId?.username || "N/A"}
                    </td>
                    <td className="p-3">{bonus.gameId?.gameId || "N/A"}</td>
                    <td className="p-3">
                      {bonus.gameId?.winnerCardId || "N/A"}
                    </td>
                    <td className="p-3">
                      {bonus.gameId?.prize
                        ? `${bonus.gameId.prize} ETB`
                        : "N/A"}
                    </td>
                    <td className="p-3">{bonus.bonusAmount} ETB</td>
                    <td className="p-3">{formatDate(bonus.dateIssued)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HouseBonusList;
