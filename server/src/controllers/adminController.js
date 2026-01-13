const adminService = require("../services/adminService");

const getGamesByDateAndUser = async (req, res, next) => {
  try {
    const games = await adminService.getGamesByDateAndUser();
    res.json(games);
  } catch (error) {
    next(error);
  }
};

const getGamesByUserId = async (req, res, next) => {
  try {
    const games = await adminService.getGamesByUserId(req.params.userId);
    res.json(games);
  } catch (error) {
    next(error);
  }
};

const getGamesByHouseId = async (req, res, next) => {
  try {
    const { games, grandTotals } = await adminService.getGamesByHouseId(
      req.params.houseId
    );
    res.json({ games, grandTotals });
  } catch (error) {
    next(error);
  }
};

const getGamesByAgentId = async (req, res, next) => {
  try {
    const { games, grandTotals } = await adminService.getGamesByAgentId(
      req.params.agentId
    );
    res.json({ games, grandTotals });
  } catch (error) {
    next(error);
  }
};
const getAllGames = async (req, res, next) => {
  try {
    const games = await adminService.getAllGames();
    res.json(games);
  } catch (error) {
    next(error);
  }
};

const getMonthlyStats = async (req, res, next) => {
  try {
    const stats = await adminService.getMonthlyStats(
      req.params.houseId,
      req.query.month
    );
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGamesByDateAndUser,
  getGamesByUserId,
  getGamesByHouseId,
  getAllGames,
  getMonthlyStats,
  getGamesByAgentId,
};
