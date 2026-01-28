const userService = require('../services/userService');
const BingoCard = require('../models/BingoCard');
const logger = require('../utils/logger');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const users = await userService.getUsers({ page, limit, search });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ message: 'User updated', user });
  } catch (error) {
    next(error);
  }
};

const updateUserPassword = async (req, res, next) => {
  try {
    const user = await userService.updateUserPassword(req.params.id, req.body);
    res.json({ message: 'User updated', user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin' && req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await userService.banUser(req.params.id, req.body.bannedBy);
    res.json({
      message: `User ${user.isBanned ? 'banned' : 'unbanned'}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

const getUsersByRole = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const role = req.params.role;
    const users = await userService.getUsersByRole({ role, page, limit, search });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUsersByHouseAdmin = async (req, res, next) => {
  try {
    const users = await userService.getUsersByHouseAdmin(req.params.houseAdminId);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUsersByAgent = async (req, res, next) => {
  try {
    const users = await userService.getUsersByAgent(req.params.agentId);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getMyUsersByAgent = async (req, res, next) => {
  try {
    const users = await userService.getUsersByAgent(req.user.id);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const createBulk = async (req, res, next) => {
  try {
    const cardsData = req.body;
    if (!Array.isArray(cardsData)) {
      logger.warn('Invalid data format for bulk card creation');
      return res.status(400).json({ message: 'Invalid data format. Expected an array of cards.' });
    }

    const savedCards = await Promise.all(cardsData.map(card => BingoCard.insert(card)));
    logger.info(`Bulk created ${savedCards.length} bingo cards`);
    res.status(201).json(savedCards);
  } catch (err) {
    logger.error(`Error creating bingo cards: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const bulkUploadCards = async (req, res, next) => {
  try {
    const { userId, cardsData } = req.body;
    console.log("re.body returns",userId, cardsData);
    if (!userId) {
      logger.warn('Missing user ID for bulk card upload');
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!Array.isArray(cardsData)) {
      logger.warn('Invalid data format for bulk card upload');
      return res.status(400).json({ message: 'Expected an array of cards.' });
    }

    // Delete old cards
    await BingoCard.remove({ userId }, { multi: true });
    logger.info(`Deleted old bingo cards for user: ${userId}`);

    // Insert new cards
    const savedCards = await Promise.all(
      cardsData.map(card => BingoCard.insert({...card, userId, cardId: String(card.cardId) }))
    );

    logger.info(`Bulk uploaded ${savedCards.length} bingo cards for user: ${userId}`);
    res.status(201).json(savedCards);
  } catch (err) {
    logger.error(`Error uploading bingo cards: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const userCards = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const cards = await BingoCard.find({ userId });
    if (!cards || cards.length === 0) {
      logger.warn(`No bingo cards found for user: ${userId}`);
      return res.status(404).json({ message: 'No bingo cards found for this user' });
    }
    logger.info(`Fetched ${cards.length} bingo cards for user: ${userId}`);
    res.status(200).json({ message: 'Bingo cards fetched', cards });
  } catch (error) {
    next(error);
  }
};

const userCardById = async (req, res, next) => {
  try {
    const { userId, cardId } = req.params;
    const card = await BingoCard.findOne({ userId, cardId });
    if (!card) {
      logger.warn(`No bingo card found for user: ${userId}, card: ${cardId}`);
      return res.status(404).json({ message: 'No bingo card found' });
    }
    logger.info(`Fetched bingo card ${cardId} for user: ${userId}`);
    res.status(200).json({ message: 'Bingo card fetched', cards: [card] });
  } catch (error) {
    next(error);
  }
};

const getCashiers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const cashiers = await userService.getUsersByRole({ role: 'cashier', page, limit, search });
    res.json(cashiers);
  } catch (error) {
    next(error);
  }
};

const updateDynamicBonus = async (req, res, next) => {
  try {
    const { enableDynamicBonus } = req.body;
    const user = await userService.updateDynamicBonus(req.params.id, enableDynamicBonus, req.user.role);
    res.json({ message: 'Dynamic bonus updated', user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCashiers,
  getUsers,
  userCardById,
  getUserById,
  updateUser,
  updateDynamicBonus,
  deleteUser,
  createBulk,
  bulkUploadCards,
  userCards,
  banUser,
  getUsersByRole,
  getUsersByHouseAdmin,
  getUsersByAgent,
  getMyUsersByAgent,
  updateUserPassword
};