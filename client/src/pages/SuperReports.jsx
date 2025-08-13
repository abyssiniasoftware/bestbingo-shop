import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiService from "../api/apiService";
import MainFilters from "../components/ui/MainFilters";
import SummaryMetrics from "../components/ui/SummaryMetrics";
import EarningsChart from "../components/ui/EarningsChart";
import AdditionalFilters from "../components/ui/AdditionalFilters";
import GameHistoryTable from "../components/ui/GameHistoryTable";

const SuperReports = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showTopFilters, setShowTopFilters] = useState(false);
  const [showBottomFilters, setShowBottomFilters] = useState(false);
  const [visibleHouses, setVisibleHouses] = useState({});

  useEffect(() => {
    const fetchSuperStats = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.fetchSuperStats(filters.month);
        setStats(data);
        setVisibleHouses(
          data.houses.reduce((acc, house) => {
            acc[house.houseName] = true;
            return acc;
          }, {})
        );
        setError(null);
      } catch (err) {
        const errorMessage = err.message || "Failed to fetch super admin stats";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuperStats();
  }, [filters.month]);

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
          <MainFilters
            filters={filters}
            setFilters={setFilters}
            showTopFilters={showTopFilters}
            setShowTopFilters={setShowTopFilters}
            setCurrentPage={setCurrentPage}
            stats={stats}
          />
          <SummaryMetrics filters={filters} stats={stats} />
          <EarningsChart
            filters={filters}
            stats={stats}
            visibleHouses={visibleHouses}
            setVisibleHouses={setVisibleHouses}
          />
          <AdditionalFilters
            filters={filters}
            setFilters={setFilters}
            showBottomFilters={showBottomFilters}
            setShowBottomFilters={setShowBottomFilters}
            setCurrentPage={setCurrentPage}
            stats={stats}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
          <GameHistoryTable
            filters={filters}
            stats={stats}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </div>
      )}
    </div>
  );
};

export default SuperReports;
