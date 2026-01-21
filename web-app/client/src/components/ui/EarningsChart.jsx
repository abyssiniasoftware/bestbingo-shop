import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const EarningsChart = ({ filters, stats, visibleHouses, setVisibleHouses }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const chartData = useMemo(() => {
    if (!stats || !stats.houses) return [];

    const dates = new Set();
    const houseEarnings = {};

    stats.houses
      .filter(
        (house) => !filters.houseName || house.houseName === filters.houseName,
      )
      .forEach((house) => {
        house.gameHistory
          .filter((game) => {
            const gameDate = new Date(game.date);
            return (
              (!filters.dateRange.start ||
                gameDate >= filters.dateRange.start) &&
              (!filters.dateRange.end || gameDate <= filters.dateRange.end)
            );
          })
          .forEach((game) => {
            const date = new Date(game.date).toLocaleDateString("en-ET", {
              day: "numeric",
              month: "short",
            });
            dates.add(date);
            houseEarnings[house.houseName] =
              houseEarnings[house.houseName] || {};
            houseEarnings[house.houseName][date] =
              (houseEarnings[house.houseName][date] || 0) + game.systemEarnings;
          });
      });

    return Array.from(dates)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => {
        const entry = { date };
        stats.houses.forEach((house) => {
          entry[house.houseName] = houseEarnings[house.houseName]?.[date] || 0;
        });
        return entry;
      });
  }, [stats, filters.houseName, filters.dateRange]);

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

  const toggleHouseVisibility = (houseName) => {
    setVisibleHouses((prev) => ({
      ...prev,
      [houseName]: !prev[houseName],
    }));
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-white">
        Earnings Over Time by House
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            formatter={(value, name) => [`${formatCurrency(value)} ETB`, name]}
          />
          <Legend
            onClick={(e) => toggleHouseVisibility(e.dataKey)}
            formatter={(value) => (
              <span style={{ color: visibleHouses[value] ? "#fff" : "#666" }}>
                {value}
              </span>
            )}
          />
          {stats.houses
            .filter(
              (house) =>
                !filters.houseName || house.houseName === filters.houseName,
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
  );
};

export default EarningsChart;
