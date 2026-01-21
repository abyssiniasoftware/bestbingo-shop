const bingoCardService = require('../services/bingoCardService');
const logger = require('../utils/logger');

const generateCard = async (req, res, next) => {
  try {
    const card = await bingoCardService.generateCard(req.body);
    logger.info(`Generated bingo card for user: ${req.body.userId}`);
    res.status(201).json({ message: 'Bingo card created', card });
  } catch (error) {
    logger.error(`Error generating bingo card: ${error.message}`);
    next(error);
  }
};

const getCardsByUser = async (req, res, next) => {
  try {
    const cards = await bingoCardService.getCardsByUser(req.params.userId);
    logger.info(`Fetched cards for user: ${req.params.userId}`);
    res.json(cards);
  } catch (error) {
    logger.error(`Error fetching cards by user: ${error.message}`);
    next(error);
  }
};

const getCardById = async (req, res, next) => {
  try {
    const card = await bingoCardService.getCardById(req.params.userId, req.params.cardId);
    logger.info(`Fetched card ${req.params.cardId} for user: ${req.params.userId}`);
    res.json(card);
  } catch (error) {
    logger.error(`Error fetching card by ID: ${error.message}`);
    next(error);
  }
};

const getCardIds = async (req, res, next) => {
  try {
    const cardIds = await bingoCardService.getCardIds(req.params.userId);
    logger.info(`Fetched card IDs for user: ${req.params.userId}`);
    res.json(cardIds);
  } catch (error) {
    logger.error(`Error fetching card IDs: ${error.message}`);
    next(error);
  }
};

const updateCard = async (req, res, next) => {
  try {
    const card = await bingoCardService.updateCard(req.params.userId, req.params.cardId, req.body);
    logger.info(`Updated card ${req.params.cardId} for user: ${req.params.userId}`);
    res.json({ message: 'Bingo card updated', card });
  } catch (error) {
    logger.error(`Error updating card: ${error.message}`);
    next(error);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    await bingoCardService.deleteCard(req.params.userId, req.params.cardId);
    logger.info(`Deleted card ${req.params.cardId} for user: ${req.params.userId}`);
    res.json({ message: 'Bingo card deleted' });
  } catch (error) {
    logger.error(`Error deleting card: ${error.message}`);
    next(error);
  }
};

const deleteAllCards = async (req, res, next) => {
  try {
    await bingoCardService.deleteAllCards(req.params.userId);
    logger.info(`Deleted all cards for user: ${req.params.userId}`);
    res.json({ message: 'All bingo cards deleted' });
  } catch (error) {
    logger.error(`Error deleting all cards: ${error.message}`);
    next(error);
  }
};

const bulkCreateCards = async (req, res, next) => {
  try {
    const cards = await bingoCardService.bulkCreateCards(req.body);
    logger.info(`Bulk created ${cards.length} bingo cards`);
    res.status(201).json({ message: 'Bingo cards created', cards });
  } catch (error) {
    logger.error(`Error bulk creating cards: ${error.message}`);
    next(error);
  }
};

module.exports = {
  generateCard,
  getCardsByUser,
  getCardById,
  getCardIds,
  updateCard,
  deleteCard,
  deleteAllCards,
  bulkCreateCards
};