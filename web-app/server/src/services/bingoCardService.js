const BingoCard = require("../models/BingoCard");
const logger = require("../utils/logger");

const generateCard = async ({ userId, cardId, ...numbers }) => {
  const existingCard = await BingoCard.findOne({ userId, cardId });

  if (existingCard) {
    await BingoCard.updateOne({ userId, cardId }, { $set: { ...numbers } });
    logger.info(`Bingo card updated: ${cardId}`);
    return await BingoCard.findOne({ userId, cardId });
  }

  const bingoCard = new BingoCard({ cardId, userId, ...numbers });
  await bingoCard.save();
  logger.info(`Bingo card created: ${cardId}`);
  return bingoCard;
};

const getCardsByUser = async (userId) => {
  const cards = await BingoCard.find({ userId }).sort({ cardId: -1 });
  logger.info(`Fetched cards for user: ${userId}`);
  return cards;
};

const getCardById = async (userId, cardId) => {
  const card = await BingoCard.findOne({ userId, cardId });
  if (!card) {
    logger.warn(`Card not found: ${cardId} for user: ${userId}`);
    throw new Error("Bingo card not found");
  }
  logger.info(`Fetched card: ${cardId}`);
  return card;
};

const getCardIds = async (userId) => {
  const cards = await BingoCard.find({ userId }, "cardId").sort({ cardId: 1 });
  logger.info(`Fetched card IDs for user: ${userId}`);
  return cards.map((card) => card.cardId);
};

const updateCard = async (userId, cardId, updates) => {
  const card = await BingoCard.findOneAndUpdate(
    { userId, cardId },
    { $set: updates },
    { new: true }
  );
  if (!card) {
    logger.warn(`Card not found for update: ${cardId}`);
    throw new Error("Bingo card not found");
  }
  logger.info(`Card updated: ${cardId}`);
  return card;
};

const deleteCard = async (userId, cardId) => {
  const card = await BingoCard.findOneAndDelete({ userId, cardId });
  if (!card) {
    logger.warn(`Card not found for deletion: ${cardId}`);
    throw new Error("Bingo card not found");
  }
  logger.info(`Card deleted: ${cardId}`);
  return card;
};

const deleteAllCards = async (userId) => {
  const result = await BingoCard.deleteMany({ userId });
  logger.info(`Deleted all cards for user: ${userId}`);
  return result;
};

const bulkCreateCards = async (cardsData) => {
  const cards = await BingoCard.insertMany(cardsData);
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
  bulkCreateCards,
};
