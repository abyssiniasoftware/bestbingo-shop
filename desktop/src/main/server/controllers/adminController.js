const adminService = require('../services/adminService');
const logger = require('../utils/logger');

const getGamesByDateAndUser = async (req, res, next) => {
  try {
    const games = await adminService.getGamesByDateAndUser();
    logger.info('Fetched games by date and user');
    res.json(games);
  } catch (error) {
    logger.error(`Error fetching games by date and user: ${error.message}`);
    next(error);
  }
};

const getGamesByUserId = async (req, res, next) => {
  try {
    const games = await adminService.getGamesByUserId(req.params.userId);
    logger.info(`Fetched games for user: ${req.params.userId}`);
    res.json(games);
  } catch (error) {
    logger.error(`Error fetching games by user ID: ${error.message}`);
    next(error);
  }
};

const getGamesByHouseId = async (req, res, next) => {
  try {
    const { games, grandTotals } = await adminService.getGamesByHouseId(req.params.houseId);
    logger.info(`Fetched games for house: ${req.params.houseId}`);
    res.json({ games, grandTotals });
  } catch (error) {
    logger.error(`Error fetching games by house ID: ${error.message}`);
    next(error);
  }
};

const getGamesByAgentId = async (req, res, next) => {
  try {
    const { games, grandTotals } = await adminService.getGamesByAgentId(req.params.agentId);
    logger.info(`Fetched games for agent: ${req.params.agentId}`);
    res.json({ games, grandTotals });
  } catch (error) {
    logger.error(`Error fetching games by agent ID: ${error.message}`);
    next(error);
  }
};

const getAllGames = async (req, res, next) => {
  try {
    const games = await adminService.getAllGames();
    logger.info('Fetched all games');
    res.json(games);
  } catch (error) {
    logger.error(`Error fetching all games: ${error.message}`);
    next(error);
  }
};

const getMonthlyStats = async (req, res, next) => {
  try {
    const stats = await adminService.getMonthlyStats(req.params.houseId, req.query.month);
    logger.info(`Fetched monthly stats for house: ${req.params.houseId}`);
    res.json(stats);
  } catch (error) {
    logger.error(`Error fetching monthly stats: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getGamesByDateAndUser,
  getGamesByUserId,
  getGamesByHouseId,
  getAllGames,
  getMonthlyStats,
  getGamesByAgentId
};