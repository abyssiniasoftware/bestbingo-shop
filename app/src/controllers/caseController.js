const BingoGame = require("../models/BingoGame");
const House = require("../models/House");
const User = require("../models/User");

// Get house admin case statistics and recent games
exports.getHouseCaseStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, status, minStake } = req.query;

    const user = await User.findById(userId);
    if (!user || !user.houseId) {
      return res.status(404).json({ message: "House not found for this user" });
    }

    const houseId = user.houseId;
    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Build query for metrics (filtered)
    let metricsQuery = { houseId: house._id };

    if (startDate && endDate) {
      const normalizedStart = new Date(startDate);
      normalizedStart.setHours(0, 0, 0, 0);

      const normalizedEnd = new Date(endDate);
      normalizedEnd.setHours(23, 59, 59, 999);

      metricsQuery.startedAt = {
        $gte: normalizedStart,
        $lte: normalizedEnd,
      };
    }
    if (status) {
      metricsQuery.finished = status === "Finished";
    }
    if (minStake) {
      metricsQuery.totalStake = { $gte: parseFloat(minStake) };
    }

    // Today's games query (unfiltered by status or minStake)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayQuery = {
      houseId: house._id,
      startedAt: { $gte: todayStart, $lte: todayEnd },
    };

    // Aggregate metrics and fetch recent games
    const [gameStats, todayGames, recentGames] = await Promise.all([
      BingoGame.aggregate([
        { $match: metricsQuery },
        {
          $group: {
            _id: null,
            totalGames: { $sum: 1 },
            totalStake: { $sum: "$totalStake" },
            totalPrize: { $sum: "$prize" },
            totalSystemEarnings: { $sum: "$systemEarnings" },
            avgStakePerGame: { $avg: "$totalStake" },
          },
        },
      ]),
      BingoGame.aggregate([
        { $match: todayQuery },
        {
          $group: {
            _id: null,
            totalGames: { $sum: 1 },
            totalPlayersToday: { $sum: "$numberOfPlayers" },
            totalSystemEarningsToday: { $sum: "$systemEarnings" },
          },
        },
      ]),
      BingoGame.find({ houseId: house._id })
        .populate("userId", "username")
        .sort({ startedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const stats = gameStats[0] || {
      totalGames: 0,
      totalStake: 0,
      totalPrize: 0,
      totalSystemEarnings: 0,
      avgStakePerGame: 0,
    };

    const todayStats = todayGames[0] || {
      totalGames: 0,
      totalPlayersToday: 0,
      totalSystemEarningsToday: 0,
    };

    res.json({
      houseName: house.name,
      stats: {
        totalGames: stats.totalGames,
        totalStake: stats.totalStake.toFixed(2),
        totalPrize: stats.totalPrize.toFixed(2),
        totalSystemEarnings: stats.totalSystemEarnings.toFixed(2),
        avgStakePerGame: stats.avgStakePerGame.toFixed(2),
        todaysGames: todayStats.totalGames,
        totalPlayersToday: todayStats.totalPlayersToday,
        totalSystemEarningsToday:
          todayStats.totalSystemEarningsToday.toFixed(2),
      },
      recentGames: recentGames.map((game) => ({
        gameId: game.gameId,
        numberOfPlayers: game.numberOfPlayers,
        totalStake: game.totalStake.toFixed(2),
        prize: game.prize.toFixed(2),
        winner: game.winnerCardId
          ? `Card ${game.winnerCardId}`
          : "No winner yet",
        status: game.finished ? "Finished" : "Ongoing",
        startedAt: game.startedAt,
        username: game.userId?.username || "N/A",
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
