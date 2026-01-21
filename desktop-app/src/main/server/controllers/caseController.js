const BingoGame = require('../models/BingoGame');
const House = require('../models/House');
const User = require('../models/User');
const logger = require('../utils/logger');

const getHouseCaseStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, status, minStake } = req.query;

    const user = await User.findOne({ _id: userId });
    if (!user || !user.houseId) {
      logger.warn(`House not found for user: ${userId}`);
      return res.status(404).json({ message: 'House not found for this user' });
    }

    const house = await House.findOne({ _id: user.houseId });
    if (!house) {
      logger.warn(`House not found: ${user.houseId}`);
      return res.status(404).json({ message: 'House not found' });
    }

    let metricsQuery = { houseId: house._id };
    if (startDate && endDate) {
      const normalizedStart = new Date(startDate);
      normalizedStart.setHours(0, 0, 0, 0);
      const normalizedEnd = new Date(endDate);
      normalizedEnd.setHours(23, 59, 59, 999);
      metricsQuery.startedAt = { $gte: normalizedStart, $lte: normalizedEnd };
    }
    if (status) {
      metricsQuery.finished = status === 'Finished';
    }
    if (minStake) {
      metricsQuery.totalStake = { $gte: parseFloat(minStake) };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayQuery = { houseId: house._id, startedAt: { $gte: todayStart, $lte: todayEnd } };

    const games = await BingoGame.find(metricsQuery);
    const todayGames = await BingoGame.find(todayQuery);
    const recentGames = await BingoGame.find({ houseId: house._id });
    const users = await User.find({ _id: { $in: recentGames.map(g => g.userId).filter(Boolean) } });

    const stats = {
      totalGames: games.length,
      totalStake: games.reduce((sum, game) => sum + game.totalStake, 0),
      totalPrize: games.reduce((sum, game) => sum + game.prize, 0),
      totalSystemEarnings: games.reduce((sum, game) => sum + game.systemEarnings, 0),
      avgStakePerGame: games.length ? games.reduce((sum, game) => sum + game.totalStake, 0) / games.length : 0
    };

    const todayStats = {
      totalGames: todayGames.length,
      totalPlayersToday: todayGames.reduce((sum, game) => sum + game.numberOfPlayers, 0),
      totalSystemEarningsToday: todayGames.reduce((sum, game) => sum + game.systemEarnings, 0)
    };

    const populatedRecentGames = recentGames
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, 10)
      .map(game => {
        const gameUser = users.find(u => u._id.toString() === game.userId?.toString());
        return {
          gameId: game.gameId,
          numberOfPlayers: game.numberOfPlayers,
          totalStake: game.totalStake.toFixed(2),
          prize: game.prize.toFixed(2),
          winner: game.winnerCardId ? `Card ${game.winnerCardId}` : 'No winner yet',
          status: game.finished ? 'Finished' : 'Ongoing',
          startedAt: game.startedAt,
          username: gameUser?.username || 'N/A'
        };
      });

    logger.info(`Fetched house case stats for house: ${house._id}`);
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
        totalSystemEarningsToday: todayStats.totalSystemEarningsToday.toFixed(2)
      },
      recentGames: populatedRecentGames
    });
  } catch (error) {
    logger.error(`Error fetching house case stats: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getHouseCaseStats };