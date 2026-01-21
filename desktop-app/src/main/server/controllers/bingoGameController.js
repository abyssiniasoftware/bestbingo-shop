const bingoGameService = require('../services/bingoGameService');
const House = require('../models/House');
const User = require('../models/User');
const Bonus = require('../models/Bonus');
const BingoGame = require('../models/BingoGame');
const CollectBonus = require('../models/CollectBonus');
const logger = require('../utils/logger');

const createGame = async (req, res, next) => {
  try {
    const game = await bingoGameService.createGame(req.body);
    logger.info(`Created bingo game: ${game.gameId}`);
    res.status(201).json({ message: 'Game created', game });
  } catch (error) {
    logger.error(`Error creating game: ${error.message}`);
    next(error);
  }
};

const updateGameWinner = async (req, res, next) => {
  try {
    const game = await bingoGameService.updateGameWinner(req.body);
    logger.info(`Updated winner for game: ${game.gameId}`);
    res.json({ message: 'Game winner updated', game });
  } catch (error) {
    logger.error(`Error updating game winner: ${error.message}`);
    next(error);
  }
};

const getGamesByUser = async (req, res, next) => {
  try {
    const games = await bingoGameService.getGamesByUser(req.params.userId);
    logger.info(`Fetched games for user: ${req.params.userId}`);
    res.json(games);
  } catch (error) {
    logger.error(`Error fetching games by user: ${error.message}`);
    next(error);
  }
};

const getLastGame = async (req, res, next) => {
  try {
    const game = await bingoGameService.getLastGame(req.params.userId);
    if (!game) {
      return res.status(200).json(null);
    }
    logger.info(`Fetched last game for user: ${req.params.userId}`);
    res.json(game);
  } catch (error) {
    logger.error(`Error fetching last game: ${error.message}`);
    next(error);
  }
};

const getGameById = async (req, res, next) => {
  try {
    const game = await bingoGameService.getGameById(req.params.userId, req.params.gameId);
    logger.info(`Fetched game ${req.params.gameId} for user: ${req.params.userId}`);
    res.json(game);
  } catch (error) {
    logger.error(`Error fetching game by ID: ${error.message}`);
    next(error);
  }
};

const deleteGame = async (req, res, next) => {
  try {
    await bingoGameService.deleteGame(req.params.userId, req.params.gameId);
    logger.info(`Deleted game ${req.params.gameId} for user: ${req.params.userId}`);
    res.json({ message: 'Game deleted' });
  } catch (error) {
    logger.error(`Error deleting game: ${error.message}`);
    next(error);
  }
};

const deleteAllGames = async (req, res, next) => {
  try {
    await bingoGameService.deleteAllGames();
    logger.info('Deleted all games');
    res.json({ message: 'All games deleted' });
  } catch (error) {
    logger.error(`Error deleting all games: ${error.message}`);
    next(error);
  }
};

const awardBonus = async (req, res) => {
  try {
    const { cashierId, gameId, houseId, bonusAmount } = req.body;

    const [game, house, cashier] = await Promise.all([
      BingoGame.findOne({ gameId, houseId }),
      House.findOne({ _id: houseId }),
      User.findOne({ _id: cashierId })
    ]);

    if (!game || !house || !cashier) {
      logger.warn(`Game, house, or cashier not found for bonus award: ${gameId}, ${houseId}, ${cashierId}`);
      return res.status(404).json({ message: 'Game, House, or Cashier not found' });
    }

    const existingBonus = await Bonus.findOne({ gameId, houseId });
    if (existingBonus) {
      logger.warn(`Bonus already awarded for game: ${gameId}`);
      return res.status(409).json({
        message: 'Bonus for this game has already been awarded',
        bonus: existingBonus
      });
    }

    let bonus;
    if (cashier.enableDynamicBonus) {
      const collectBonus = await CollectBonus.findOne({ houseId, status: 'active' });
      if (!collectBonus || collectBonus.bonusAmount <= 0) {
        logger.warn(`No active dynamic bonus for house: ${houseId}`);
        return res.status(400).json({ message: 'No active dynamic bonus available' });
      }

      bonus = await Bonus.insert({
        cashierId,
        gameId,
        houseId,
        bonusAmount: collectBonus.bonusAmount,
        bonusType: 'dynamic',
        collectBonusId: collectBonus._id,
        dateIssued: new Date()
      });

      await CollectBonus.updateOne({ _id: collectBonus._id }, { status: 'taken' });
      await CollectBonus.insert({ houseId, bonusAmount: 0, status: 'active' });
    } else {
      bonus = await Bonus.insert({
        cashierId,
        gameId,
        houseId,
        bonusAmount: Number(bonusAmount) || 500,
        bonusType: 'manual',
        dateIssued: new Date()
      });
    }

    logger.info(`Awarded bonus for game: ${gameId}, house: ${houseId}`);
    res.status(201).json({ message: 'Bonus awarded successfully', bonus });
  } catch (err) {
    logger.error(`Error awarding bonus: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getActiveDynamicBonus = async (req, res) => {
  try {
    const { houseId } = req.user;
    const collectBonus = await CollectBonus.findOne({ houseId, status: 'active' });

    if (!collectBonus) {
      logger.info(`No active dynamic bonus found for house: ${houseId}, returning 0`);
      return res.status(200).json({ bonusAmount: 0 });
    }

    logger.info(`Fetched active dynamic bonus for house: ${houseId}`);
    res.status(200).json({ bonusAmount: collectBonus.bonusAmount });
  } catch (err) {
    logger.error(`Error fetching active dynamic bonus: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllBonuses = async (req, res) => {
  try {
    const bonuses = await Bonus.find({});
    const [cashiers, houses, games, gameUsers] = await Promise.all([
      User.find({ _id: { $in: bonuses.map(b => b.cashierId).filter(Boolean) } }),
      House.find({ _id: { $in: bonuses.map(b => b.houseId).filter(Boolean) } }),
      BingoGame.find({ gameId: { $in: bonuses.map(b => b.gameId).filter(Boolean) } }),
      User.find({ _id: { $in: bonuses.map(b => b.userId).filter(Boolean) } })
    ]);

    const enrichedBonuses = bonuses
      .sort((a, b) => b.dateIssued - a.dateIssued)
      .map(bonus => {
        const cashier = cashiers.find(c => c._id.toString() === bonus.cashierId?.toString());
        const house = houses.find(h => h._id.toString() === bonus.houseId?.toString());
        const game = games.find(g => g.gameId === bonus.gameId);
        const gameUser = gameUsers.find(u => u._id.toString() === game?.userId?.toString());
        return {
          ...bonus,
          cashierId: cashier ? { _id: cashier._id, username: cashier.username, branch: cashier.branch } : null,
          houseId: house ? { _id: house._id, name: house.name } : null,
          gameId: game ? {
            gameId: game.gameId,
            userId: gameUser ? { _id: gameUser._id, username: gameUser.username, branch: gameUser.branch } : null,
            winnerCardId: game.winnerCardId,
            prize: game.prize,
            startedAt: game.startedAt,
            finished: game.finished,
            stakeAmount: game.stakeAmount,
            numberOfPlayers: game.numberOfPlayers,
            totalStake: game.totalStake,
            systemEarnings: game.systemEarnings
          } : null
        };
      });

    logger.info('Fetched all bonuses');
    res.status(200).json({
      message: 'Bonuses retrieved successfully',
      bonuses: enrichedBonuses.length ? enrichedBonuses : []
    });
  } catch (err) {
    logger.error(`Error fetching all bonuses: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllBonusesUnderAgent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'agent') {
      logger.warn(`Access denied for non-agent user: ${req.user?.id}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    const agentId = req.user.id;
    const cashiers = await User.find({ role: 'cashier', registeredBy: agentId });
    const cashierIds = cashiers.map(cashier => cashier._id);

    if (!cashierIds.length) {
      logger.warn(`No cashiers found for agent: ${agentId}`);
      return res.status(404).json({ message: 'No users found registered by you' });
    }

    const bonuses = await Bonus.find({ cashierId: { $in: cashierIds } });
    const [houses, games, gameUsers] = await Promise.all([
      House.find({ _id: { $in: bonuses.map(b => b.houseId).filter(Boolean) } }),
      BingoGame.find({ gameId: { $in: bonuses.map(b => b.gameId).filter(Boolean) } }),
      User.find({ _id: { $in: bonuses.map(b => b.userId).filter(Boolean) } })
    ]);

    const enrichedBonuses = bonuses
      .sort((a, b) => b.dateIssued - a.dateIssued)
      .map(bonus => {
        const cashier = cashiers.find(c => c._id.toString() === bonus.cashierId?.toString());
        const house = houses.find(h => h._id.toString() === bonus.houseId?.toString());
        const game = games.find(g => g.gameId === bonus.gameId);
        const gameUser = gameUsers.find(u => u._id.toString() === game?.userId?.toString());
        return {
          ...bonus,
          cashierId: cashier ? { _id: cashier._id, username: cashier.username, branch: cashier.branch } : null,
          houseId: house ? { _id: house._id, name: house.name } : null,
          gameId: game ? {
            gameId: game.gameId,
            userId: gameUser ? { _id: gameUser._id, username: gameUser.username, branch: gameUser.branch } : null,
            winnerCardId: game.winnerCardId,
            prize: game.prize,
            startedAt: game.startedAt,
            finished: game.finished,
            stakeAmount: game.stakeAmount,
            numberOfPlayers: game.numberOfPlayers,
            totalStake: game.totalStake,
            systemEarnings: game.systemEarnings
          } : null
        };
      });

    logger.info(`Fetched bonuses for agent: ${agentId}`);
    res.status(200).json({
      message: 'Bonuses retrieved successfully',
      bonuses: enrichedBonuses.length ? enrichedBonuses : []
    });
  } catch (err) {
    logger.error(`Error fetching bonuses under agent: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getLastWinner = async (req, res) => {
  try {
    const lastGame = await BingoGame.findOne({ winnerCardId: { $ne: null }, finished: true });
    if (!lastGame) {
      logger.warn('No games with a winner found');
      return res.status(404).json({ message: 'No games with a winner found' });
    }

    const [user, house, bonus, bonusCashier, bonusHouse] = await Promise.all([
      User.findOne({ _id: lastGame.userId }),
      House.findOne({ _id: lastGame.houseId }),
      Bonus.findOne({ gameId: lastGame.gameId }),
      Bonus.findOne({ gameId: lastGame.gameId }).then(b => b ? User.findOne({ _id: b.cashierId }) : null),
      Bonus.findOne({ gameId: lastGame.gameId }).then(b => b ? House.findOne({ _id: b.houseId }) : null)
    ]);

    const response = {
      game: {
        gameId: lastGame.gameId,
        winnerCardId: lastGame.winnerCardId,
        prize: lastGame.prize,
        startedAt: lastGame.startedAt,
        stakeAmount: lastGame.stakeAmount,
        numberOfPlayers: lastGame.numberOfPlayers,
        totalStake: lastGame.totalStake,
        systemEarnings: lastGame.systemEarnings,
        finished: lastGame.finished,
        userId: user ? { _id: user._id, username: user.username, branch: user.branch } : null,
        houseId: house ? { _id: house._id, name: house.name } : null
      },
      bonus: bonus ? {
        ...bonus,
        cashierId: bonusCashier ? { _id: bonusCashier._id, username: bonusCashier.username, branch: bonusCashier.branch } : null,
        houseId: bonusHouse ? { _id: bonusHouse._id, name: bonusHouse.name } : null
      } : null
    };

    logger.info(`Fetched last winner for game: ${lastGame.gameId}`);
    res.status(200).json({ message: 'Last winner retrieved successfully', data: response });
  } catch (err) {
    logger.error(`Error fetching last winner: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getBonusesByHouse = async (req, res) => {
  try {
    const { houseId } = req.params;
    const house = await House.findOne({ _id: houseId });
    if (!house) {
      logger.warn(`House not found: ${houseId}`);
      return res.status(404).json({ message: 'House not found' });
    }

    const bonuses = await Bonus.find({ houseId });
    const [cashiers, games, gameUsers] = await Promise.all([
      User.find({ _id: { $in: bonuses.map(b => b.cashierId).filter(Boolean) } }),
      BingoGame.find({ gameId: { $in: bonuses.map(b => b.gameId).filter(Boolean) } }),
      User.find({ _id: { $in: bonuses.map(b => b.userId).filter(Boolean) } })
    ]);

    const enrichedBonuses = bonuses
      .sort((a, b) => b.dateIssued - a.dateIssued)
      .map(bonus => {
        const cashier = cashiers.find(c => c._id.toString() === bonus.cashierId?.toString());
        const game = games.find(g => g.gameId === bonus.gameId);
        const gameUser = gameUsers.find(u => u._id.toString() === game?.userId?.toString());
        return {
          ...bonus,
          cashierId: cashier ? { _id: cashier._id, username: cashier.username, branch: cashier.branch } : null,
          houseId: { _id: house._id, name: house.name },
          gameId: game ? {
            gameId: game.gameId,
            userId: gameUser ? { _id: gameUser._id, username: gameUser.username, branch: gameUser.branch } : null,
            winnerCardId: game.winnerCardId,
            prize: game.prize,
            startedAt: game.startedAt,
            finished: game.finished,
            stakeAmount: game.stakeAmount,
            numberOfPlayers: game.numberOfPlayers,
            totalStake: game.totalStake,
            systemEarnings: game.systemEarnings
          } : null
        };
      });

    if (!enrichedBonuses.length) {
      logger.warn(`No bonuses found for house: ${houseId}`);
      return res.status(404).json({ message: 'No bonuses found for this house' });
    }

    logger.info(`Fetched bonuses for house: ${houseId}`);
    res.status(200).json({
      message: 'Bonuses retrieved successfully',
      bonuses: enrichedBonuses
    });
  } catch (err) {
    logger.error(`Error fetching bonuses by house: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const markBonusInactive = async (req, res) => {
  try {
    const { houseId, cashierId } = req.body;
    const user = await User.findOne({ _id: cashierId });

    if (!user || user.role !== 'cashier') {
      logger.warn(`Invalid cashier for marking bonus inactive: ${cashierId}`);
      return res.status(403).json({ message: 'Only cashiers can mark bonuses as inactive' });
    }

    const collectBonus = await CollectBonus.findOne({ houseId, status: 'active' });
    if (!collectBonus || collectBonus.bonusAmount <= 0) {
      logger.warn(`No active dynamic bonus found for house: ${houseId}`);
      return res.status(404).json({ message: 'No active dynamic bonus found' });
    }

    await CollectBonus.updateOne({ _id: collectBonus._id }, { status: 'inactive' });
    const newCollectBonus = await CollectBonus.insert({ houseId, bonusAmount: 0, status: 'active' });

    logger.info(`Marked bonus inactive and created new bonus pool for house: ${houseId}`);
    res.status(200).json({
      message: 'Bonus taken by cashier, new bonus pool created',
      collectBonus: newCollectBonus
    });
  } catch (err) {
    logger.error(`Error marking bonus inactive: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createGame,
  updateGameWinner,
  getGamesByUser,
  getLastGame,
  getGameById,
  deleteGame,
  deleteAllGames,
  awardBonus,
  getAllBonuses,
  getLastWinner,
  getBonusesByHouse,
  getAllBonusesUnderAgent,
  getActiveDynamicBonus,
  markBonusInactive
};