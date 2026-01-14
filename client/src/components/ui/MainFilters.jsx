import React from "react";
import { FaFilter, FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MainFilters = ({
  filters,
  setFilters,
  showTopFilters,
  setShowTopFilters,
  setCurrentPage,
  stats,
}) => {
  const handleHouseFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      houseName: e.target.value,
    }));
    setCurrentPage(1);
  };

  const handleMonthFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      month: e.target.value,
    }));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
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
  };

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

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowTopFilters(!showTopFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          <FaFilter /> {showTopFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showTopFilters && (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Main Filters</h2>
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
    </>
  );
};

export default MainFilters;
