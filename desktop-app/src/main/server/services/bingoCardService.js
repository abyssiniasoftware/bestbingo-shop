const BingoCard = require('../models/BingoCard');
const logger = require('../utils/logger');

const generateCard = async ({ userId, cardId, ...numbers }) => {
  const existingCard = await BingoCard.findOne({ userId, cardId });

  if (existingCard) {
    await BingoCard.updateOne({ userId, cardId }, numbers);
    logger.info(`Bingo card updated: ${cardId}`);
    return await BingoCard.findOne({ userId, cardId });
  }

  const bingoCard = await BingoCard.insert({ cardId, userId, ...numbers });
  logger.info(`Bingo card created: ${cardId}`);
  return bingoCard;
};

const getCardsByUser = async (userId) => {
  const cards = await BingoCard.find({ userId });
  logger.info(`Fetched cards for user: ${userId}`);
  return cards.sort((a, b) => b.cardId - a.cardId);
};

const getCardById = async (userId, cardId) => {
  const card = await BingoCard.findOne({ userId, cardId });
  if (!card) {
    logger.warn(`Card not found: ${cardId} for user: ${userId}`);
    throw new Error('Bingo card not found');
  }
  logger.info(`Fetched card: ${cardId}`);
  return card;
};

const getCardIds = async (userId) => {
  const cards = await BingoCard.find({ userId });
  logger.info(`Fetched card IDs for user: ${userId}`);
  return cards.map(card => card.cardId).sort((a, b) => a - b);
};

const updateCard = async (userId, cardId, updates) => {
  const num = await BingoCard.updateOne({ userId, cardId }, updates);
  if (num === 0) {
    logger.warn(`Card not found for update: ${cardId}`);
    throw new Error('Bingo card not found');
  }
  const card = await BingoCard.findOne({ userId, cardId });
  logger.info(`Card updated: ${cardId}`);
  return card;
};

const deleteCard = async (userId, cardId) => {
  const num = await BingoCard.remove({ userId, cardId });
if (num === 0) {
  logger.warn(`Card not found for deletion: ${cardId}`);
  throw new Error('Bingo card not found');
}
logger.info(`Card deleted: ${cardId}`);
return { userId, cardId };

};

const deleteAllCards = async (userId) => {
 const num = await BingoCard.remove({ userId }, { multi: true });
logger.info(`Deleted all cards for user: ${userId}`);
return { deletedCount: num };

};

const bulkCreateCards = async (cardsData) => {
  const cards = await Promise.all(cardsData.map(card => BingoCard.insert(card)));
  logger.info(`Bulk created ${cards.length} bingo cards`);
  return cards;
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