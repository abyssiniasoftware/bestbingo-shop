
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const History = ({ userId }) => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWinners = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/game/${userId}/last-winners`);
        if (!response.ok) throw new Error("Failed to fetch winners");
        const data = await response.json();
        setWinners(data);
      } catch (err) {
        setError("Error fetching winners");
        toast.error("Failed to load winners");
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center mb-4">Last 10 Winners</h2>
      {winners.length === 0 ? (
        <p className="text-center">No winners found.</p>
      ) : (
        <ul className="space-y-2">
          {winners.map((winner, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 border-b"
            >
              <span className="text-green-700 font-bold">
                Card ID {winner.winnerCartela}
              </span>
              <span className="text-gray-700">Game {winner.gameId}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;