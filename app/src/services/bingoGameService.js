const BingoGame = require("../models/BingoGame");
const User = require("../models/User");
const House = require("../models/House");
const logger = require("../utils/logger");
const CollectBonus = require("../models/CollectBonus");
const mongoose = require("mongoose");

const createGame = async ({
  houseId,
  userId,
  stakeAmount,
  numberOfPlayers,
  cutAmountPercent,
  cartela,
  gameId,
}) => {
  // Input validation
  if (stakeAmount <= 0) throw new Error("Stake amount must be greater than 0");
  if (numberOfPlayers <= 0)
    throw new Error("Number of players must be greater than 0");
  if (cutAmountPercent <= 0 || cutAmountPercent >= 100)
    throw new Error("Cut percent must be between 0 and 100");

  // Fetch and validate house and admin
  const house = await House.findById(houseId);
  if (!house) {
    logger.warn(`House not found: ${houseId}`);
    throw new Error("House not found");
  }
  const houseAdmin = await User.findById(house.houseAdminId);
  if (!houseAdmin) {
    logger.warn(`House admin not found for house: ${houseId}`);
    throw new Error("House admin not found");
  }

  const cashier = house.cashierId ? await User.findById(house.cashierId) : null;

  // Compute base values
  const totalStake = stakeAmount * numberOfPlayers;
  const systemEarnings = (cutAmountPercent / 100) * totalStake;
  let prize = totalStake - systemEarnings;
  let bonusDeduction = 0;

  // Initial dynamic bonus for brand-new games
  const isUpdateRequest = Boolean(gameId);
  let game;
  if (!isUpdateRequest) {
    if (cashier?.enableDynamicBonus) {
      bonusDeduction = prize * 0.05;
      prize -= bonusDeduction;
    }
  }

  // Determine if we should update an existing game or create a new one
  if (isUpdateRequest) {
    game = await BingoGame.findOne({ houseId, gameId, finished: false });
    if (!game) {
      logger.info(
        `Game ${gameId} not found or already finished, creating a new game instead`
      );
    }
  }

  if (!game) {
    // Check admin balance
    if (houseAdmin.package < systemEarnings) {
      logger.warn(
        `Insufficient package balance for house: ${houseId}, have ${houseAdmin.package}, need ${systemEarnings}`
      );
      throw new Error("Insufficient package balance");
    }

    // Generate next gameId
    const lastGame = await BingoGame.findOne({ houseId }).sort({ gameId: -1 });
    const newGameId = lastGame ? lastGame.gameId + 1 : 1;

    // Build and save
    game = new BingoGame({
      gameId: newGameId,
      houseId,
      userId,
      stakeAmount,
      numberOfPlayers,
      totalStake,
      cutAmountPercent,
      prize,
      systemEarnings,
      cartela,
    });

    // Deduct admin package
    houseAdmin.package -= systemEarnings;
  } else {
    // If no changes in core inputs, short‑circuit
    const unchanged =
      game.stakeAmount === stakeAmount &&
      game.numberOfPlayers === numberOfPlayers &&
      game.cutAmountPercent === cutAmountPercent &&
      JSON.stringify(game.cartela) === JSON.stringify(cartela);

    if (unchanged) {
      logger.info(`No changes for game ${gameId}, skipping update.`);
      return game;
    }

    // Recompute values
    const oldPlayers = game.numberOfPlayers;
    const additionalPlayers = numberOfPlayers - oldPlayers;
    game.stakeAmount = stakeAmount;
    game.numberOfPlayers = numberOfPlayers;
    game.cutAmountPercent = cutAmountPercent;
    game.cartela = cartela;
    game.totalStake = totalStake;

    // New system earnings and prize
    const newSystem = systemEarnings;
    const oldSystem = game.systemEarnings;
    prize = totalStake - newSystem;

    // Charge/refund admin for system earnings delta
    const deltaSystem = newSystem - oldSystem;
    if (deltaSystem > 0) {
      if (houseAdmin.package < deltaSystem) {
        logger.warn(
          `Insufficient package for delta: need ${deltaSystem}, have ${houseAdmin.package}`
        );
        throw new Error("Insufficient package balance");
      }
      houseAdmin.package -= deltaSystem;
    } else if (deltaSystem < 0) {
      houseAdmin.package += -deltaSystem;
    }
    game.systemEarnings = newSystem;

    // Dynamic bonus and prize adjustments for player changes
    if (additionalPlayers !== 0 && cashier?.enableDynamicBonus) {
      const additionalStake = stakeAmount * Math.abs(additionalPlayers);
      const additionalEarnings = (cutAmountPercent / 100) * additionalStake;
      const additionalPrize = additionalStake - additionalEarnings;
      const additionalBonus = additionalPrize * 0.05;

      // Collect or refund bonus
      bonusDeduction +=
        additionalPlayers > 0 ? additionalBonus : -additionalBonus;

      // Update prize
      game.prize =
        additionalPlayers > 0
          ? game.prize + additionalPrize - additionalBonus
          : game.prize - additionalPrize + additionalBonus;

      // Adjust admin package for added/removed players
      if (additionalPlayers > 0) {
        houseAdmin.package -= additionalEarnings;
      } else {
        houseAdmin.package += additionalPrize;
      }
    } else if (additionalPlayers !== 0) {
      // No dynamic bonus, only prize change
      const changeAmt = stakeAmount * Math.abs(additionalPlayers);
      game.prize =
        additionalPlayers > 0 ? game.prize + changeAmt : game.prize - changeAmt;

      // Refund/charge admin earnings
      const earningsChange = (cutAmountPercent / 100) * changeAmt;
      if (additionalPlayers > 0) {
        houseAdmin.package -= earningsChange;
      } else {
        houseAdmin.package += changeAmt;
      }
    } else {
      // No player change: recalc prize minus any dynamic bonus
      if (cashier?.enableDynamicBonus) {
        const dynCut = prize * 0.05;
        bonusDeduction += dynCut;
        game.prize = prize - dynCut;
      } else {
        game.prize = prize;
      }
    }
  }

  // Transactionally update CollectBonus, admin, cashier, and game
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    if (cashier?.enableDynamicBonus && bonusDeduction !== 0) {
      let cb = await CollectBonus.findOne({
        houseId,
        status: "active",
      }).session(session);
      if (!cb) {
        cb = new CollectBonus({
          houseId,
          bonusAmount: bonusDeduction,
          status: "active",
        });
      } else {
        cb.bonusAmount += bonusDeduction;
      }
      await cb.save({ session });
    }
    if (cashier) {
      cashier.package = houseAdmin.package;
      await cashier.save({ session });
    }
    await houseAdmin.save({ session });
    await game.save({ session });
  });
  session.endSession();

  logger.info(
    `Game ${gameId && game.finished === false ? "updated" : "created"}: ${
      game.gameId
    } for house: ${houseId}`
  );
  return game;
};

const updateGameWinner = async ({ houseId, gameId, winnerCardId }) => {
  const game = await BingoGame.findOne({ houseId, gameId });
  if (!game) {
    logger.warn(`Game not found: ${gameId}`);
    throw new Error("Game not found");
  }

  game.winnerCardId = winnerCardId;
  game.finished = true;
  await game.save();
  logger.info(`Game winner updated: ${gameId}`);
  return game;
};

const getGamesByUser = async (userId) => {
  const games = await BingoGame.find({ userId })
    .populate("userId", "username")
    .sort({ startedAt: -1 });
  logger.info(`Fetched games for user: ${userId}`);
  return games;
};

const getLastGame = async (userId) => {
  const game = await BingoGame.findOne({ userId }).sort({ gameId: -1 });
  if (!game) {
    logger.warn(`No games found for user: ${userId}`);
    throw new Error("No games found");
  }
  logger.info(`Fetched last game for user: ${userId}`);
  return game;
};

const getGameById = async (userId, gameId) => {
  const game = await BingoGame.findOne({ userId, gameId }).populate(
    "userId",
    "username"
  );
  if (!game) {
    logger.warn(`Game not found: ${gameId} for user: ${userId}`);
    throw new Error("Game not found");
  }
  logger.info(`Fetched game: ${gameId}`);
  return game;
};

const deleteGame = async (userId, gameId) => {
  const game = await BingoGame.findOneAndDelete({ userId, gameId });
  if (!game) {
    logger.warn(`Game not found for deletion: ${gameId}`);
    throw new Error("Game not found");
  }
  logger.info(`Game deleted: ${gameId}`);
  return game;
};

const deleteAllGames = async () => {
  const result = await BingoGame.deleteMany({});
  logger.info("Deleted all games");
  return result;
};

module.exports = {
  createGame,
  updateGameWinner,
  getGamesByUser,
  getLastGame,
  getGameById,
  deleteGame,
  deleteAllGames,
};
