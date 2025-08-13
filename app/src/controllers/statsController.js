const BingoGame = require("../models/BingoGame");
const User = require("../models/User");
const Recharge = require("../models/Recharge");
const House = require("../models/House");
const getDailyStats = async (req, res) => {
  try {
    const { houseId } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const games = await BingoGame.find({
      houseId,
      startedAt: { $gte: today },
    });

    const totalGames = games.length;
    const totalEarnings = games.reduce(
      (sum, game) => sum + game.systemEarnings,
      0
    );
    const user = await User.findById(req.user.id);

    res.json({
      packageBalance: user?.package || 0,
      totalDailyEarnings: totalEarnings,
      totalGamesPlayed: totalGames,
      gameHistory: games.map((game) => ({
        date: game.startedAt,
        betAmount: game.stakeAmount,
        numberOfPlayers: game.numberOfPlayers,
        totalStake: game.totalStake,
        cutAmountPercent: game.cutAmountPercent,
        prize: game.prize,
        winnerNumber: game.winnerCardId,
        systemEarnings: game.systemEarnings,
      })),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getHouseStats = async (req, res) => {
  try {
    const { houseId } = req.user;
    const { month, startDate, endDate } = req.query;

    let query = { houseId };
    if (startDate && endDate) {
      // Use date range if provided
      query.startedAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    } else if (month) {
      // Fallback to month filter
      const [year, monthNum] = month.split("-").map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);
      query.startedAt = { $gte: start, $lte: end };
    }

    // Today's games query (from midnight to now)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayQuery = {
      houseId,
      startedAt: { $gte: todayStart, $lte: todayEnd },
    };

    // Fetch games and today's games in parallel
    const [games, todayGames] = await Promise.all([
      BingoGame.find(query),
      BingoGame.find(todayQuery),
    ]);

    const totalGames = games.length;
    const totalEarnings = games.reduce(
      (sum, game) => sum + game.systemEarnings,
      0
    );
    const todaysGamesCount = todayGames.length;

    // Active players today (distinct player IDs)

    const user = await User.findById(req.user.id);

    res.json({
      packageBalance: user?.package || 0,
      totalDailyEarnings: totalEarnings,
      totalGamesPlayed: totalGames,
      todaysGames: todaysGamesCount,
      gameHistory: games.map((game) => ({
        date: game.startedAt,
        betAmount: game.stakeAmount,
        numberOfPlayers: game.numberOfPlayers,
        totalStake: game.totalStake,
        cutAmountPercent: game.cutAmountPercent,
        prize: game.prize,
        winnerNumber: game.winnerCardId,
        systemEarnings: game.systemEarnings,
      })),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSuperAdminStats = async (req, res) => {
  try {
    const { month } = req.query;

    // Define today's date range for totalTodayHouseProfit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    // Build match stage for games based on month filter
    let gameMatch = {};
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);
      gameMatch.startedAt = { $gte: start, $lte: end };
    }

    // Aggregate houses with games and recharges
    const houses = await House.aggregate([
      {
        // Lookup to populate houseAdminId
        $lookup: {
          from: "users", // Collection name for User model
          localField: "houseAdminId",
          foreignField: "_id",
          as: "houseAdmin",
          pipeline: [
            { $project: { package: 1 } }, // Only fetch package field
          ],
        },
      },
      {
        $unwind: {
          path: "$houseAdmin",
          preserveNullAndEmptyArrays: true, // Handle cases where houseAdminId is null
        },
      },
      {
        // Lookup games for the house
        $lookup: {
          from: "bingogames", // Collection name for BingoGame model
          let: { houseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$houseId", "$$houseId"] },
                ...gameMatch,
              },
            },
            {
              $project: {
                startedAt: 1,
                stakeAmount: 1,
                numberOfPlayers: 1,
                totalStake: 1,
                cutAmountPercent: 1,
                prize: 1,
                winnerCardId: 1,
                systemEarnings: 1,
              },
            },
          ],
          as: "games",
        },
      },
      {
        // Lookup recharges for the house
        $lookup: {
          from: "recharges", // Collection name for Recharge model
          let: { houseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$houseId", "$$houseId"] },
              },
            },
            {
              $project: {
                amount: 1,
                packageAdded: 1,
                createdAt: 1,
              },
            },
          ],
          as: "recharges",
        },
      },
      {
        // Project final house stats
        $project: {
          houseName: "$name",
          packageBalance: { $ifNull: ["$houseAdmin.package", 0] },
          totalGamesPlayed: { $size: "$games" },
          totalEarnings: {
            $sum: "$games.systemEarnings",
          },
          gameHistory: {
            $map: {
              input: "$games",
              as: "game",
              in: {
                date: "$$game.startedAt",
                betAmount: "$$game.stakeAmount",
                numberOfPlayers: "$$game.numberOfPlayers",
                totalStake: "$$game.totalStake",
                cutAmountPercent: "$$game.cutAmountPercent",
                prize: "$$game.prize",
                winnerNumber: "$$game.winnerCardId",
                systemEarnings: "$$game.systemEarnings",
              },
            },
          },
          recharges: {
            $map: {
              input: "$recharges",
              as: "recharge",
              in: {
                amount: "$$recharge.amount",
                packageAdded: "$$recharge.packageAdded",
                createdAt: "$$recharge.createdAt",
              },
            },
          },
        },
      },
    ]);

    // Calculate totalTodayHouseProfit using a separate aggregation
    const todayProfitResult = await BingoGame.aggregate([
      {
        $match: {
          startedAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalTodayHouseProfit: { $sum: "$systemEarnings" },
        },
      },
    ]);

    const totalTodayHouseProfit =
      todayProfitResult[0]?.totalTodayHouseProfit || 0;

    // Calculate global stats
    const totalEarnings = houses.reduce(
      (sum, house) => sum + (house.totalEarnings || 0),
      0
    );
    const totalGames = houses.reduce(
      (sum, house) => sum + (house.totalGamesPlayed || 0),
      0
    );

    // Send response
    res.json({
      houses,
      totalEarnings,
      totalGames,
      totalTodayHouseProfit,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAgentStats = async (req, res) => {
  try {
    const { id: agentId } = req.user; // Agent's user ID
    const { month, startDate, endDate } = req.query;

    // Find houses where houseAdminId or cashierId was registered by this agent
    const agentUsers = await User.find({ registeredBy: agentId }).select("_id");
    const agentUserIds = agentUsers.map((user) => user._id);
    const houses = await House.find({
      $or: [
        { houseAdminId: { $in: agentUserIds } },
        { cashierId: { $in: agentUserIds } },
      ],
    }).populate("houseAdminId cashierId");

    // Define date query for games and recharges
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    } else if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);
      dateQuery = { $gte: start, $lte: end };
    }

    // Today's date query
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayDateQuery = { $gte: todayStart, $lte: todayEnd };

    // Process stats for each house
    const stats = await Promise.all(
      houses.map(async (house) => {
        const baseQueryOpts = { houseId: house._id };

        const gameQueryOpts =
          Object.keys(dateQuery).length > 0
            ? { ...baseQueryOpts, startedAt: dateQuery }
            : baseQueryOpts;

        const rechargeQueryOpts =
          Object.keys(dateQuery).length > 0
            ? { ...baseQueryOpts, createdAt: dateQuery }
            : baseQueryOpts;

        // todayDateQuery is always populated with a valid date range
        const todayGameQueryOpts = {
          ...baseQueryOpts,
          startedAt: todayDateQuery,
        };
        const todayRechargeQueryOpts = {
          ...baseQueryOpts,
          createdAt: todayDateQuery,
        };

        const [games, recharges, todayGames, todayRecharges] =
          await Promise.all([
            BingoGame.find(gameQueryOpts),
            Recharge.find(rechargeQueryOpts),
            BingoGame.find(todayGameQueryOpts),
            Recharge.find(todayRechargeQueryOpts),
          ]);

        const commissionRate = 0.05; // Example: 5% commission on recharges
        const totalEarnings = games.reduce(
          (sum, game) => sum + game.systemEarnings,
          0
        );
        const totalRechargeAmount = recharges.reduce(
          (sum, r) => sum + r.amount,
          0
        );
        const totalCommissions = totalRechargeAmount * commissionRate;
        const todayRechargeAmount = todayRecharges.reduce(
          (sum, r) => sum + r.amount,
          0
        );
        const todayCommissions = todayRechargeAmount * commissionRate;

        return {
          houseName: house?.name,
          packageBalance: house?.houseAdminId?.package,
          totalGamesPlayed: games.length,
          totalEarnings,
          totalRechargeAmount,
          totalCommissions,
          todayGames: todayGames.length,
          todayRechargeAmount,
          todayCommissions,
          gameHistory: games.map((game) => ({
            date: game.startedAt,
            betAmount: game.stakeAmount,
            numberOfPlayers: game.numberOfPlayers,
            totalStake: game.totalStake,
            cutAmountPercent: game.cutAmountPercent,
            prize: game.prize,
            winnerNumber: game.winnerCardId,
            systemEarnings: game.systemEarnings,
          })),
          recharges: recharges.map((r) => ({
            amount: r.amount,
            packageAdded: r.packageAdded,
            createdAt: r.createdAt,
            commission: r.amount * commissionRate,
          })),
        };
      })
    );

    // Aggregate totals
    const totalEarnings = stats.reduce(
      (sum, house) => sum + house?.totalEarnings,
      0
    );
    const totalGames = stats.reduce(
      (sum, house) => sum + house?.totalGamesPlayed,
      0
    );
    const totalRechargeAmount = stats.reduce(
      (sum, house) => sum + house?.totalRechargeAmount,
      0
    );
    const totalCommissions = stats.reduce(
      (sum, house) => sum + house?.totalCommissions,
      0
    );
    const totalTodayGames = stats.reduce(
      (sum, house) => sum + house?.todayGames,
      0
    );
    const totalTodayRechargeAmount = stats.reduce(
      (sum, house) => sum + house?.todayRechargeAmount,
      0
    );
    const totalTodayCommissions = stats.reduce(
      (sum, house) => sum + house?.todayCommissions,
      0
    );

    res.json({
      houses: stats,
      totalEarnings,
      totalGames,
      totalRechargeAmount,
      totalCommissions,
      totalTodayGames,
      totalTodayRechargeAmount,
      totalTodayCommissions,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
  getDailyStats,
  getHouseStats,
  getSuperAdminStats,
  getAgentStats,
};
