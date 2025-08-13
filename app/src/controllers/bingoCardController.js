const bingoCardService = require('../services/bingoCardService');

const generateCard = async (req, res, next) => {
  try {
    const card = await bingoCardService.generateCard(req.body);
    res.status(201).json({ message: 'Bingo card created', card });
  } catch (error) {
    next(error);
  }
};

const getCardsByUser = async (req, res, next) => {
  try {
    const cards = await bingoCardService.getCardsByUser(req.params.userId);
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

const getCardById = async (req, res, next) => {
  try {
    const card = await bingoCardService.getCardById(req.params.userId, req.params.cardId);
    res.json(card);
  } catch (error) {
    next(error);
  }
};

const getCardIds = async (req, res, next) => {
  try {
    const cardIds = await bingoCardService.getCardIds(req.params.userId);
    res.json(cardIds);
  } catch (error) {
    next(error);
  }
};

const updateCard = async (req, res, next) => {
  try {
    const card = await bingoCardService.updateCard(
      req.params.userId,
      req.params.cardId,
      req.body
    );
    res.json({ message: 'Bingo card updated', card });
  } catch (error) {
    next(error);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    await bingoCardService.deleteCard(req.params.userId, req.params.cardId);
    res.json({ message: 'Bingo card deleted' });
  } catch (error) {
    next(error);
  }
};

const deleteAllCards = async (req, res, next) => {
  try {
    await bingoCardService.deleteAllCards(req.params.userId);
    res.json({ message: 'All bingo cards deleted' });
  } catch (error) {
    next(error);
  }
};

const bulkCreateCards = async (req, res, next) => {
  try {
    const cards = await bingoCardService.bulkCreateCards(req.body);
    res.status(201).json({ message: 'Bingo cards created', cards });
  } catch (error) {
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
  bulkCreateCards,
};