const BingoGame = require('../models/BingoGame');
const User = require('../models/User');
const Recharge = require('../models/Recharge');
const House = require('../models/House');
const logger = require('../utils/logger');

const getDailyStats = async (req, res) => {
  try {
    const { houseId } = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const games = await BingoGame.find({
      houseId,
      startedAt: { $gte: today }
    });

    const totalGames = games.length;
    const totalEarnings = games.reduce((sum, game) => sum + game.systemEarnings, 0);
    const user = await User.findOne({ _id: req.user.id });

    logger.info(`Fetched daily stats for house: ${houseId}`);
    res.json({
      packageBalance: user?.package || 0,
      totalDailyEarnings: totalEarnings,
      totalGamesPlayed: totalGames,
      gameHistory: games.map(game => ({
        gameId: game.gameId,
        date: game.startedAt,
        betAmount: game.stakeAmount,
        numberOfPlayers: game.numberOfPlayers,
        totalStake: game.totalStake,
        cutAmountPercent: game.cutAmountPercent,
        prize: game.prize,
        winnerNumber: game.winnerCardId,
        systemEarnings: game.systemEarnings
      }))
    });
  } catch (error) {
    logger.error(`Error fetching daily stats: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

const getHouseStats = async (req, res) => {
  try {
    const { houseId } = req.user;
    const { month, startDate, endDate } = req.query;

    let query = { houseId };
    if (startDate && endDate) {
      query.startedAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    } else if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);
      query.startedAt = { $gte: start, $lte: end };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayQuery = { houseId, startedAt: { $gte: todayStart, $lte: todayEnd } };

    const [games, todayGames, user] = await Promise.all([
      BingoGame.find(query),
      BingoGame.find(todayQuery),
      User.findOne({ _id: req.user.id })
    ]);

    const totalGames = games.length;
    const totalEarnings = games.reduce((sum, game) => sum + game.systemEarnings, 0);
    const todaysGamesCount = todayGames.length;

    logger.info(`Fetched house stats for house: ${houseId}`);
    res.json({
      packageBalance: user?.package || 0,
      totalDailyEarnings: totalEarnings,
      totalGamesPlayed: totalGames,
      todaysGames: todaysGamesCount,
      gameHistory: games.map(game => ({
        gameId: game.gameId,
        date: game.startedAt,
        betAmount: game.stakeAmount,
        numberOfPlayers: game.numberOfPlayers,
        totalStake: game.totalStake,
        cutAmountPercent: game.cutAmountPercent,
        prize: game.prize,
        winnerNumber: game.winnerCardId,
        systemEarnings: game.systemEarnings
      }))
    });
  } catch (error) {
    logger.error(`Error fetching house stats: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

const getSuperAdminStats = async (req, res) => {
  try {
    const { month } = req.query;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    let gameQuery = {};
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);
      gameQuery.startedAt = { $gte: start, $lte: end };
    }

    const [houses, games, recharges] = await Promise.all([
      House.find({}),
      BingoGame.find(gameQuery),
      Recharge.find({})
    ]);

    const users = await User.find({ _id: { $in: houses.map(h => h.houseAdminId).filter(Boolean) } });

    const houseStats = houses.map(house => {
      const houseGames = games.filter(g => g.houseId.toString() === house._id.toString());
      const houseRecharges = recharges.filter(r => r.houseId.toString() === house._id.toString());
      const houseAdmin = users.find(u => u._id.toString() === house.houseAdminId?.toString());

      return {
        houseName: house.name,
        packageBalance: houseAdmin?.package || 0,
        totalGamesPlayed: houseGames.length,
        totalEarnings: houseGames.reduce((sum, game) => sum + game.systemEarnings, 0),
        gameHistory: houseGames.map(game => ({
          gameId: game.gameId,
          date: game.startedAt,
          betAmount: game.stakeAmount,
          numberOfPlayers: game.numberOfPlayers,
          totalStake: game.totalStake,
          cutAmountPercent: game.cutAmountPercent,
          prize: game.prize,
          winnerNumber: game.winnerCardId,
          systemEarnings: game.systemEarnings
        })),
        recharges: houseRecharges.map(recharge => ({
          amount: recharge.amount,
          packageAdded: recharge.packageAdded,
          createdAt: recharge.createdAt
        }))
      };
    });

    const todayGames = await BingoGame.find({ startedAt: { $gte: todayStart, $lte: todayEnd } });
    const totalTodayHouseProfit = todayGames.reduce((sum, game) => sum + game.systemEarnings, 0);

    const totalEarnings = houseStats.reduce((sum, house) => sum + house.totalEarnings, 0);
    const totalGames = houseStats.reduce((sum, house) => sum + house.totalGamesPlayed, 0);

    logger.info('Fetched super admin stats');
    res.json({
      houses: houseStats,
      totalEarnings,
      totalGames,
      totalTodayHouseProfit
    });
  } catch (error) {
    logger.error(`Error fetching super admin stats: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

const getAgentStats = async (req, res) => {
  try {
    const { id: agentId } = req.user;
    const { month, startDate, endDate } = req.query;

    const agentUsers = await User.find({ registeredBy: agentId });
    const agentUserIds = agentUsers.map(user => user._id);

    const houses = await House.find({
      $or: [
        { houseAdminId: { $in: agentUserIds } },
        { cashierId: { $in: agentUserIds } }
      ]
    });

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    } else if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);
      dateQuery = { $gte: start, $lte: end };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayDateQuery = { $gte: todayStart, $lte: todayEnd };

    const stats = await Promise.all(
      houses.map(async house => {
        const baseQueryOpts = { houseId: house._id };
        const gameQueryOpts = Object.keys(dateQuery).length > 0 ? { ...baseQueryOpts, startedAt: dateQuery } : baseQueryOpts;
        const rechargeQueryOpts = Object.keys(dateQuery).length > 0 ? { ...baseQueryOpts, createdAt: dateQuery } : baseQueryOpts;
        const todayGameQueryOpts = { ...baseQueryOpts, startedAt: todayDateQuery };
        const todayRechargeQueryOpts = { ...baseQueryOpts, createdAt: todayDateQuery };

        const [games, recharges, todayGames, todayRecharges, houseAdmin] = await Promise.all([
          BingoGame.find(gameQueryOpts),
          Recharge.find(rechargeQueryOpts),
          BingoGame.find(todayGameQueryOpts),
          Recharge.find(todayRechargeQueryOpts),
          User.findOne({ _id: house.houseAdminId })
        ]);

        const commissionRate = 0.05;
        const totalEarnings = games.reduce((sum, game) => sum + game.systemEarnings, 0);
        const totalRechargeAmount = recharges.reduce((sum, r) => sum + r.amount, 0);
        const totalCommissions = totalRechargeAmount * commissionRate;
        const todayRechargeAmount = todayRecharges.reduce((sum, r) => sum + r.amount, 0);
        const todayCommissions = todayRechargeAmount * commissionRate;

        return {
          houseName: house?.name,
          packageBalance: houseAdmin?.package,
          totalGamesPlayed: games.length,
          totalEarnings,
          totalRechargeAmount,
          totalCommissions,
          todayGames: todayGames.length,
          todayRechargeAmount,
          todayCommissions,
          gameHistory: games.map(game => ({
            gameId: game.gameId,
            date: game.startedAt,
            betAmount: game.stakeAmount,
            numberOfPlayers: game.numberOfPlayers,
            totalStake: game.totalStake,
            cutAmountPercent: game.cutAmountPercent,
            prize: game.prize,
            winnerNumber: game.winnerCardId,
            systemEarnings: game.systemEarnings
          })),
          recharges: recharges.map(r => ({
            amount: r.amount,
            packageAdded: r.packageAdded,
            createdAt: r.createdAt,
            commission: r.amount * commissionRate
          }))
        };
      })
    );

    const totalEarnings = stats.reduce((sum, house) => sum + house?.totalEarnings, 0);
    const totalGames = stats.reduce((sum, house) => sum + house?.totalGamesPlayed, 0);
    const totalRechargeAmount = stats.reduce((sum, house) => sum + house?.totalRechargeAmount, 0);
    const totalCommissions = stats.reduce((sum, house) => sum + house?.totalCommissions, 0);
    const totalTodayGames = stats.reduce((sum, house) => sum + house?.todayGames, 0);
    const totalTodayRechargeAmount = stats.reduce((sum, house) => sum + house?.todayRechargeAmount, 0);
    const totalTodayCommissions = stats.reduce((sum, house) => sum + house?.todayCommissions, 0);

    logger.info(`Fetched agent stats for agent: ${agentId}`);
    res.json({
      houses: stats,
      totalEarnings,
      totalGames,
      totalRechargeAmount,
      totalCommissions,
      totalTodayGames,
      totalTodayRechargeAmount,
      totalTodayCommissions
    });
  } catch (error) {
    logger.error(`Error fetching agent stats: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getDailyStats,
  getHouseStats,
  getSuperAdminStats,
  getAgentStats
};