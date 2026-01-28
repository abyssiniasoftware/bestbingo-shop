const BingoGame = require('../models/BingoGame');
const User = require('../models/User');
const House = require('../models/House');
const logger = require('../utils/logger');
const CollectBonus = require('../models/CollectBonus');

const createGame = async ({ houseId, userId, stakeAmount, numberOfPlayers, cutAmountPercent, cartela, gameId }) => {
  const house = await House.findOne({ _id: houseId });
  if (!house) {
    logger.warn(`House not found: ${houseId}`);
    throw new Error('House not found');
  }

  const houseAdmin = await User.findOne({ _id: house.houseAdminId });
  if (!houseAdmin) {
    logger.warn(`House admin not found for house: ${houseId}`);
    throw new Error('House admin not found');
  }

  const cashier = house.cashierId ? await User.findOne({ _id: house.cashierId }) : null;
  let game;
  let systemEarnings;
  let bonusDeduction = 0;

  const totalStake = stakeAmount * numberOfPlayers;
  systemEarnings = (cutAmountPercent / 100) * totalStake;
  let prize = totalStake - systemEarnings;

  if (cashier?.enableDynamicBonus && !gameId) {
    bonusDeduction = prize * 0.05;
    prize -= bonusDeduction;
  }

  if (gameId) {
    game = await BingoGame.findOne({ gameId, houseId, finished: false });
    if (!game) {
      logger.warn(`Game not found: ${gameId} for house: ${houseId}`);
      throw new Error('Game not found');
    }

    const additionalPlayers = numberOfPlayers - game.numberOfPlayers;

    game.stakeAmount = stakeAmount;
    game.numberOfPlayers = numberOfPlayers;
    game.cutAmountPercent = cutAmountPercent;
    game.cartela = cartela;
    game.totalStake = totalStake;
    game.systemEarnings = systemEarnings;

    if (additionalPlayers !== 0) {
      const additionalStake = stakeAmount * Math.abs(additionalPlayers);
      const additionalEarnings = (cutAmountPercent / 100) * additionalStake;
      const additionalPrize = additionalStake - additionalEarnings;
      let additionalBonus = 0;

      if (cashier?.enableDynamicBonus) {
        additionalBonus = additionalPrize * 0.01;
        logger.info(`Applied additional bonus of ${additionalBonus} for ${additionalPlayers} players`);
        bonusDeduction += additionalPlayers > 0 ? additionalBonus : -additionalBonus;
        game.prize = additionalPlayers > 0
          ? game.prize + additionalPrize - additionalBonus
          : game.prize - additionalPrize + additionalBonus;
      } else {
        game.prize = additionalPlayers > 0
          ? game.prize + additionalPrize
          : game.prize - additionalPrize;
      }

      if (game.prize < 0) {
        logger.warn(`Prize cannot be negative for game: ${gameId}`);
        throw new Error('Invalid prize calculation');
      }

      if (additionalPlayers > 0) {
        if (houseAdmin.package < additionalEarnings) {
          logger.warn(`Insufficient package balance for house: ${houseId}`);
          throw new Error('Insufficient package balance');
        }
        await User.updateOne({ _id: houseAdmin._id }, { package: houseAdmin.package - additionalEarnings });
      } else {
        const refundAmount = additionalPrize;
        await User.updateOne({ _id: houseAdmin._id }, { package: houseAdmin.package + refundAmount });
        logger.info(`Refunded ${refundAmount} to house admin for ${-additionalPlayers} removed players in game: ${gameId}`);
      }
    } else {
      game.prize = cashier?.enableDynamicBonus ? game.prize : prize;
    }

    await BingoGame.updateOne({ _id: game._id }, game);
  } else {
    if (houseAdmin.package < systemEarnings) {
      logger.warn(`Insufficient package balance for house: ${houseId}`);
      throw new Error('Insufficient package balance');
    }

    const lastGame = (await BingoGame.find({ houseId })).sort((a, b) => b.gameId - a.gameId)[0];
    const newGameId = lastGame ? lastGame.gameId + 1 : 1;

    game = await BingoGame.insert({
      gameId: newGameId,
      houseId,
      userId,
      stakeAmount,
      numberOfPlayers,
      totalStake,
      cutAmountPercent,
      prize,
      systemEarnings,
      cartela
    });

    await User.updateOne({ _id: houseAdmin._id }, { package: houseAdmin.package - systemEarnings });
  }

  if (cashier?.enableDynamicBonus && bonusDeduction !== 0) {
    try {
      let collectBonus = await CollectBonus.findOne({ houseId, status: 'active' });
      if (!collectBonus) {
        collectBonus = await CollectBonus.insert({
          houseId,
          bonusAmount: bonusDeduction,
          status: 'active'
        });
      } else {
        await CollectBonus.updateOne({ _id: collectBonus._id }, { bonusAmount: collectBonus.bonusAmount + bonusDeduction });
      }
    } catch (error) {
      logger.error(`Failed to update CollectBonus: ${error.message}`);
      throw error;
    }
  }

  if (cashier) {
    await User.updateOne({ _id: cashier._id }, { package: houseAdmin.package });
  }

  logger.info(`Game ${gameId ? 'updated' : 'created'}: ${game.gameId} for house: ${houseId}`);
  return game;
};

const updateGameWinner = async ({ houseId, gameId, winnerCardId }) => {
  const game = await BingoGame.findOne({ houseId, gameId });
  if (!game) {
    logger.warn(`Game not found: ${gameId}`);
    throw new Error('Game not found');
  }

  await BingoGame.updateOne({ _id: game._id }, { winnerCardId, finished: true });
  const updatedGame = await BingoGame.findOne({ _id: game._id });
  logger.info(`Game winner updated: ${gameId}`);
  return updatedGame;
};

const getGamesByUser = async (userId) => {
  const games = await BingoGame.find({ userId });
  const populatedGames = await Promise.all(games.map(async (game) => {
    const user = await User.findOne({ _id: game.userId });
    return { ...game, userId: { _id: user._id, username: user.username } };
  }));
  logger.info(`Fetched games for user: ${userId}`);
  return populatedGames.sort((a, b) => b.startedAt - a.startedAt);
};

const getLastGame = async (userId) => {
  const games = await BingoGame.find({ userId });
  const game = games.sort((a, b) => b.gameId - a.gameId)[0];
  if (!game) {
    logger.info(`No games found for user: ${userId}`);
    return null;
  }
  logger.info(`Fetched last game for user: ${userId}`);
  return game;
};

const getGameById = async (userId, gameId) => {
  const game = await BingoGame.findOne({ userId, gameId });
  if (!game) {
    logger.warn(`Game not found: ${gameId} for user: ${userId}`);
    throw new Error('Game not found');
  }
  const user = await User.findOne({ _id: game.userId });
  logger.info(`Fetched game: ${gameId}`);
  return { ...game, userId: { _id: user._id, username: user.username } };
};

const deleteGame = async (userId, gameId) => {
  const num = await BingoGame.remove({ userId, gameId });
  if (num === 0) {
    logger.warn(`Game not found for deletion: ${gameId}`);
    throw new Error('Game not found');
  }
  logger.info(`Game deleted: ${gameId}`);
  return { userId, gameId };
};

const deleteAllGames = async () => {
  const num = await BingoGame.remove({}, { multi: true });
  logger.info('Deleted all games');
  return { deletedCount: num };
};

module.exports = {
  createGame,
  updateGameWinner,
  getGamesByUser,
  getLastGame,
  getGameById,
  deleteGame,
  deleteAllGames
};