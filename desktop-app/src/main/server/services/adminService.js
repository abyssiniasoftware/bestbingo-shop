const BingoGame = require('../models/BingoGame');
const User = require('../models/User');
const House = require('../models/House');
const Recharge = require('../models/Recharge');
const logger = require('../utils/logger');

const getGamesByDateAndUser = async () => {
  const games = await BingoGame.find({});
  const users = await User.find({});

  const grouped = games.reduce((acc, game) => {
    const user = users.find(u => u._id.toString() === game.userId.toString());
    if (!user) return acc;
    const date = game.startedAt.toISOString().split('T')[0];
    const key = `${date}_${game.userId}`;
    if (!acc[key]) {
      acc[key] = {
        _id: { date, userId: game.userId, username: user.username },
        totalGames: 0,
        totalSystemEarnings: 0,
        totalPrize: 0,
        totalStake: 0
      };
    }
    acc[key].totalGames += 1;
    acc[key].totalSystemEarnings += game.systemEarnings;
    acc[key].totalPrize += game.prize;
    acc[key].totalStake += game.totalStake;
    return acc;
  }, {});

  const result = Object.values(grouped).sort((a, b) => {
    if (a._id.date === b._id.date) return a._id.userId.localeCompare(b._id.userId);
    return b._id.date.localeCompare(a._id.date);
  });

  logger.info('Fetched games grouped by date and user');
  return result;
};

const getGamesByUserId = async (userId) => {
  const games = await BingoGame.find({ userId });

  const grouped = games.reduce((acc, game) => {
    const date = game.startedAt.toISOString().split('T')[0];
    const key = `${date}_${game.userId}`;
    if (!acc[key]) {
      acc[key] = {
        _id: { date, userId: game.userId },
        totalGames: 0,
        totalSystemEarnings: 0,
        totalPrize: 0,
        totalStake: 0
      };
    }
    acc[key].totalGames += 1;
    acc[key].totalSystemEarnings += game.systemEarnings;
    acc[key].totalPrize += game.prize;
    acc[key].totalStake += game.totalStake;
    return acc;
  }, {});

  const result = Object.values(grouped).sort((a, b) => b._id.date.localeCompare(a._id.date));
  logger.info(`Fetched games for user: ${userId}`);
  return result;
};

const getGamesByHouseId = async (houseId) => {
  const house = await House.findOne({ _id: houseId });
  if (!house) {
    logger.warn(`House not found: ${houseId}`);
    throw new Error('House not found');
  }

  const userIds = [house.houseAdminId, house.cashierId].filter(Boolean);
  const games = await BingoGame.find({ userId: { $in: userIds } });
  const users = await User.find({ _id: { $in: userIds } });

  const grouped = games.reduce((acc, game) => {
    const user = users.find(u => u._id.toString() === game.userId.toString());
    if (!user) return acc;
    const date = game.startedAt.toISOString().split('T')[0];
    const key = `${date}_${game.userId}`;
    if (!acc[key]) {
      acc[key] = {
        _id: { date, userId: game.userId },
        totalGames: 0,
        totalSystemEarnings: 0,
        totalPrize: 0,
        totalStake: 0,
        userFullname: user.fullname
      };
    }
    acc[key].totalGames += 1;
    acc[key].totalSystemEarnings += game.systemEarnings;
    acc[key].totalPrize += game.prize;
    acc[key].totalStake += game.totalStake;
    return acc;
  }, {});

  const gamesResult = Object.values(grouped).sort((a, b) => b._id.date.localeCompare(a._id.date));
  const grandTotals = {
    totalGames: gamesResult.reduce((sum, game) => sum + game.totalGames, 0),
    totalSystemEarnings: gamesResult.reduce((sum, game) => sum + game.totalSystemEarnings, 0),
    totalPrize: gamesResult.reduce((sum, game) => sum + game.totalPrize, 0),
    totalStake: gamesResult.reduce((sum, game) => sum + game.totalStake, 0)
  };

  logger.info(`Fetched games for house: ${houseId}`);
  return { games: gamesResult, grandTotals };
};

const getGamesByAgentId = async (agentId) => {
  const users = await User.find({ registeredBy: agentId });
  const userIds = users.map(user => user._id);
  const games = await BingoGame.find({ userId: { $in: userIds } });

  const grouped = games.reduce((acc, game) => {
    const user = users.find(u => u._id.toString() === game.userId.toString());
    if (!user) return acc;
    const date = game.startedAt.toISOString().split('T')[0];
    const key = `${date}_${game.userId}`;
    if (!acc[key]) {
      acc[key] = {
        _id: { date, userId: game.userId },
        totalGames: 0,
        totalSystemEarnings: 0,
        totalPrize: 0,
        totalStake: 0,
        userFullname: user.fullname
      };
    }
    acc[key].totalGames += 1;
    acc[key].totalSystemEarnings += game.systemEarnings;
    acc[key].totalPrize += game.prize;
    acc[key].totalStake += game.totalStake;
    return acc;
  }, {});

  const gamesResult = Object.values(grouped).sort((a, b) => b._id.date.localeCompare(a._id.date));
  const grandTotals = {
    totalGames: gamesResult.reduce((sum, game) => sum + game.totalGames, 0),
    totalSystemEarnings: gamesResult.reduce((sum, game) => sum + game.totalSystemEarnings, 0),
    totalPrize: gamesResult.reduce((sum, game) => sum + game.totalPrize, 0),
    totalStake: gamesResult.reduce((sum, game) => sum + game.totalStake, 0)
  };

  logger.info(`Fetched games for agent: ${agentId}`);
  return { games: gamesResult, grandTotals };
};

const getAllGames = async () => {
  const games = await BingoGame.find({});
  const houses = await House.find({});
  const users = await User.find({});

  const populatedGames = games.map(game => {
    const user = users.find(u => u._id.toString() === game.userId.toString());
    const house = houses.find(h => h._id.toString() === user?.houseId?.toString());
    return {
      ...game,
      userId: user ? {
        _id: user._id,
        fullname: user.fullname,
        phone: user.phone,
        houseId: house ? { _id: house._id, name: house.name } : null
      } : null
    };
  }).sort((a, b) => b.startedAt - a.startedAt);

  logger.info('Fetched all games');
  return populatedGames;
};

const getMonthlyStats = async (houseId, month) => {
  let query = { houseId };
  if (month) {
    const [year, monthNum] = month.split('-').map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0);
    query.startedAt = { $gte: start, $lte: end };
  }

  const games = await BingoGame.find(query);
  const recharges = await Recharge.find({ houseId });
  const house = await House.findOne({ _id: houseId });
  const houseAdmin = house ? await User.findOne({ _id: house.houseAdminId }) : null;

  const stats = {
    packageBalance: houseAdmin?.package || 0,
    totalGames: games.length,
    totalSystemEarnings: games.reduce((sum, game) => sum + game.systemEarnings, 0),
    gameHistory: games.map(game => ({
      date: game.startedAt,
      stakeAmount: game.stakeAmount,
      numberOfPlayers: game.numberOfPlayers,
      totalStake: game.totalStake,
      cutAmountPercent: game.cutAmountPercent,
      prize: game.prize,
      winnerCardId: game.winnerCardId,
      systemEarnings: game.systemEarnings
    })),
    recharges: recharges.map(r => ({
      amount: r.amount,
      packageAdded: r.packageAdded,
      createdAt: r.createdAt
    }))
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
  getGamesByAgentId
};