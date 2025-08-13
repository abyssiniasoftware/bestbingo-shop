const BingoGame = require("../models/BingoGame");
const User = require("../models/User");
const House = require("../models/House");
const Recharge = require("../models/Recharge");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

const getGamesByDateAndUser = async () => {
  const games = await BingoGame.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          userId: "$userId",
          username: "$user.username",
        },
        totalGames: { $sum: 1 },
        totalSystemEarnings: { $sum: "$systemEarnings" },
        totalPrize: { $sum: "$prize" },
        totalStake: { $sum: "$totalStake" },
      },
    },
    { $sort: { "_id.date": -1, "_id.userId": 1 } },
  ]);
  logger.info("Fetched games grouped by date and user");
  return games;
};

const getGamesByUserId = async (userId) => {
  const games = await BingoGame.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          userId: "$userId",
        },
        totalGames: { $sum: 1 },
        totalSystemEarnings: { $sum: "$systemEarnings" },
        totalPrize: { $sum: "$prize" },
        totalStake: { $sum: "$totalStake" },
      },
    },
    { $sort: { "_id.date": -1 } },
  ]);
  logger.info(`Fetched games for user: ${userId}`);
  return games;
};

const getGamesByHouseId = async (houseId) => {
  const house = await House.findById(houseId);
  if (!house) {
    logger.warn(`House not found: ${houseId}`);
    throw new Error("House not found");
  }

  const userIds = [house.houseAdminId, house.cashierId].filter(Boolean);
  const games = await BingoGame.aggregate([
    {
      $match: {
        userId: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          userId: "$userId",
        },
        totalGames: { $sum: 1 },
        totalSystemEarnings: { $sum: "$systemEarnings" },
        totalPrize: { $sum: "$prize" },
        totalStake: { $sum: "$totalStake" },
        userFullname: { $first: "$userInfo.fullname" },
      },
    },
    { $sort: { "_id.date": -1 } },
  ]);

  const grandTotals = {
    totalGames: games.reduce((sum, game) => sum + game.totalGames, 0),
    totalSystemEarnings: games.reduce(
      (sum, game) => sum + game.totalSystemEarnings,
      0
    ),
    totalPrize: games.reduce((sum, game) => sum + game.totalPrize, 0),
    totalStake: games.reduce((sum, game) => sum + game.totalStake, 0),
  };

  logger.info(`Fetched games for house: ${houseId}`);
  return { games, grandTotals };
};
const getGamesByAgentId = async (agentId) => {
  const users = await User.find({ registeredBy: agentId }).select("_id");
  const userIds = users.map((user) => user._id);
  const games = await BingoGame.aggregate([
    {
      $match: {
        userId: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          userId: "$userId",
        },
        totalGames: { $sum: 1 },
        totalSystemEarnings: { $sum: "$systemEarnings" },
        totalPrize: { $sum: "$prize" },
        totalStake: { $sum: "$totalStake" },
        userFullname: { $first: "$userInfo.fullname" },
      },
    },
    { $sort: { "_id.date": -1 } },
  ]);

  const grandTotals = {
    totalGames: games.reduce((sum, game) => sum + game.totalGames, 0),
    totalSystemEarnings: games.reduce(
      (sum, game) => sum + game.totalSystemEarnings,
      0
    ),
    totalPrize: games.reduce((sum, game) => sum + game.totalPrize, 0),
    totalStake: games.reduce((sum, game) => sum + game.totalStake, 0),
  };

  logger.info(`Fetched games for agent: ${agentId}`);
  return { games, grandTotals };
};

const getAllGames = async () => {
  const games = await BingoGame.find()
    .populate({
      path: "userId",
      select: "fullname phone houseId",
      populate: {
        path: "houseId",
        select: "name",
      },
    })
    .sort({ startedAt: -1 });
  logger.info("Fetched all games");
  return games;
};

const getMonthlyStats = async (houseId, month) => {
  const query = { houseId };
  if (month) {
    const [year, monthNum] = month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0);
    query.startedAt = { $gte: start, $lte: end };
  }

  const games = await BingoGame.find(query);
  const recharges = await Recharge.find({ houseId });
  const house = await House.findById(houseId).populate("houseAdminId");

  const stats = {
    packageBalance: house.houseAdminId.package,
    totalGames: games.length,
    totalSystemEarnings: games.reduce(
      (sum, game) => sum + game.systemEarnings,
      0
    ),
    gameHistory: games.map((game) => ({
      date: game.startedAt,
      stakeAmount: game.stakeAmount,
      numberOfPlayers: game.numberOfPlayers,
      totalStake: game.totalStake,
      cutAmountPercent: game.cutAmountPercent,
      prize: game.prize,
      winnerCardId: game.winnerCardId,
      systemEarnings: game.systemEarnings,
    })),
    recharges: recharges.map((r) => ({
      amount: r.amount,
      packageAdded: r.packageAdded,
      createdAt: r.createdAt,
    })),
  };

  logger.info(`Fetched monthly stats for house: ${houseId}`);
  return stats;
};

module.exports = {
  getGamesByDateAndUser,
  getGamesByUserId,
  getGamesByHouseId,
  getAllGames,
  getMonthlyStats,
  getGamesByAgentId,
};
