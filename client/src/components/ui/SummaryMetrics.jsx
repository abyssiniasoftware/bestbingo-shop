import React, { useMemo, useState, useEffect } from "react";

const SummaryMetrics = ({ filters, stats }) => {
  const [paymentData, setPaymentData] = useState({
    kidusamount: 0,
    tekesteamount: 0,
  });
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoadingPayment(true);
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/payment`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === "success") {
          setPaymentData({
            kidusamount: parseFloat(data.kidusamount) || 0,
            tekesteamount: parseFloat(data.tekesteamount) || 0,
          });
        } else {
          throw new Error(
            "Failed to fetch payment data: API status not success"
          );
        }
        setPaymentError(null);
      } catch (error) {
        setPaymentError(error.message);
        // Keep default or previously fetched values if error occurs
        setPaymentData({ kidusamount: 0, tekesteamount: 0 });
      } finally {
        setLoadingPayment(false);
      }
    };

    fetchPaymentData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const metrics = useMemo(() => {
    const baseMetrics = {
      totalDeposits: 0,
      todayGames: 0,
      todayDeposits: 0,
      totalEarnings: 0,
      totalGames: 0,
      totalHouses: 0,
      totalTodayHouseProfit: 0,
    };

    if (!stats || !stats.houses) return baseMetrics;

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
      totalTodayHouseProfit: stats.totalTodayHouseProfit || 0,
    };
  }, [stats, filters.houseName, filters.dateRange]);

  const amountToPay = useMemo(() => {
    return metrics.totalDeposits * 0.2;
  }, [metrics.totalDeposits]);

  const remainingToPay = useMemo(() => {
    return amountToPay - paymentData.tekesteamount;
  }, [paymentData.tekesteamount, amountToPay]);

  if (loadingPayment) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-300">Loading Metrics...</p>
      </div>
    );
  }

  if (paymentError) {
    // Optionally display a more user-friendly error message or just log it
    // You might want to render the rest of the metrics even if payment data fails
    // or show a specific error card for payment data.
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-600 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">Total Houses</h2>
        <p className="text-2xl text-red-400">{metrics.totalHouses}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">
          Total Houses Profit (ETB)
        </h2>
        <p className="text-2xl text-yellow-400">
          {formatCurrency(metrics.totalEarnings)}
        </p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-600 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">Total Games</h2>
        <p className="text-2xl text-green-400">{metrics.totalGames}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">
          Total Deposits (ETB)
        </h2>
        <p className="text-2xl text-blue-400">
          {formatCurrency(metrics.totalDeposits)}
        </p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">Today's Games</h2>
        <p className="text-2xl text-purple-400">{metrics.todayGames}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-pink-600 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">
          Today's Deposits (ETB)
        </h2>
        <p className="text-2xl text-pink-400">
          {formatCurrency(metrics.todayDeposits)}
        </p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-orange-600 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">
          Today's House Profit (ETB)
        </h2>
        <p className="text-2xl text-orange-400">
          {formatCurrency(metrics.totalTodayHouseProfit)}
        </p>
      </div>

      {/* Tekeste Amount Card */}
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">
          Paid Amount (ETB)
        </h2>
        <p className="text-2xl text-teal-400">
          {formatCurrency(paymentData.tekesteamount)}
        </p>
      </div>

      {/* Amount to Pay Card */}
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-cyan-500 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">
          Amount to Pay (20% of Deposits)
        </h2>
        <p className="text-2xl text-cyan-400">{formatCurrency(amountToPay)}</p>
      </div>

      {/* Remaining to Pay Card */}
      <div className="bg-gray-800 p-6 rounded-lg shadow border-l-4 border-lime-500 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-300">
          Remaining to Pay (ETB)
        </h2>
        <p className="text-2xl text-lime-400">
          {formatCurrency(remainingToPay)}
        </p>
      </div>
    </div>
  );
};

export default SummaryMetrics;
