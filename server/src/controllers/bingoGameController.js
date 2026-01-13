const bingoGameService = require("../services/bingoGameService");
const House = require("../models/House"); // Import House model
const User = require("../models/User");
const Bonus = require("../models/Bonus"); // Import Bonus model
const BingoGame = require("../models/BingoGame");
const logger = require("../utils/logger");
const mongoose = require("mongoose");
const CollectBonus = require("../models/CollectBonus");

const createGame = async (req, res, next) => {
  try {
    const game = await bingoGameService.createGame(req.body);
    res.status(201).json({ message: "Game created", game });
  } catch (error) {
    next(error);
  }
};

const updateGameWinner = async (req, res, next) => {
  try {
    const game = await bingoGameService.updateGameWinner(req.body);
    res.json({ message: "Game winner updated", game });
  } catch (error) {
    next(error);
  }
};

const getGamesByUser = async (req, res, next) => {
  try {
    const games = await bingoGameService.getGamesByUser(req.params.userId);
    res.json(games);
  } catch (error) {
    next(error);
  }
};

const getLastGame = async (req, res, next) => {
  try {
    const game = await bingoGameService.getLastGame(req.params.userId);
    res.json(game);
  } catch (error) {
    next(error);
  }
};

const getGameById = async (req, res, next) => {
  try {
    const game = await bingoGameService.getGameById(
      req.params.userId,
      req.params.gameId
    );
    res.json(game);
  } catch (error) {
    next(error);
  }
};

const deleteGame = async (req, res, next) => {
  try {
    await bingoGameService.deleteGame(req.params.userId, req.params.gameId);
    res.json({ message: "Game deleted" });
  } catch (error) {
    next(error);
  }
};

const deleteAllGames = async (req, res, next) => {
  try {
    await bingoGameService.deleteAllGames();
    res.json({ message: "All games deleted" });
  } catch (error) {
    next(error);
  }
};

const awardBonus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cashierId, gameId, houseId, bonusAmount } = req.body;

    const game = await BingoGame.findOne({ gameId, houseId }).session(session);
    const house = await House.findById(houseId).session(session);
    const cashier = await User.findById(cashierId).session(session);

    if (!game || !house || !cashier) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Game, House, or Cashier not found" });
    }

    const existingBonus = await Bonus.findOne({ gameId, houseId }).session(
      session
    );
    if (existingBonus) {
      await session.abortTransaction();
      return res.status(409).json({
        message: "Bonus for this game has already been awarded",
        bonus: existingBonus,
      });
    }

    let bonus;
    if (cashier.enableDynamicBonus) {
      const collectBonus = await CollectBonus.findOne({
        houseId,
        status: "active",
      }).session(session);
      if (!collectBonus || collectBonus.bonusAmount <= 0) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "No active dynamic bonus available" });
      }

      bonus = new Bonus({
        cashierId,
        gameId,
        houseId,
        bonusAmount: collectBonus.bonusAmount,
        bonusType: "dynamic",
        collectBonusId: collectBonus._id,
      });

      collectBonus.status = "taken";
      await collectBonus.save({ session });

      const newCollectBonus = new CollectBonus({
        houseId,
        bonusAmount: 0,
        status: "active",
      });
      await newCollectBonus.save({ session });
    } else {
      bonus = new Bonus({
        cashierId,
        gameId,
        houseId,
        bonusAmount: Number(bonusAmount) || 500,
        bonusType: "manual",
      });
    }

    await bonus.save({ session });
    await session.commitTransaction();

    res.status(201).json({ message: "Bonus awarded successfully", bonus });
  } catch (err) {
    await session.abortTransaction();

    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    session.endSession();
  }
};

const getActiveDynamicBonus = async (req, res) => {
  try {
    const { houseId } = req.user;
    const collectBonus = await CollectBonus.findOne({
      houseId,
      status: "active",
    });

    if (!collectBonus) {
      return res.status(404).json({ message: "No active dynamic bonus found" });
    }

    res.status(200).json({ bonusAmount: collectBonus.bonusAmount });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllBonuses = async (req, res) => {
  try {
    // Fetch all bonuses with populated cashier and house
    const bonuses = await Bonus.find()
      .populate("cashierId", "username branch")
      .populate("houseId", "name")
      .sort({ dateIssued: -1 }); // Sort by most recent

    if (!bonuses || bonuses.length === 0) {
      return res.status(200).json({ message: "No bonuses found", bonuses: [] });
    }

    // Manually fetch game details for each bonus
    const enrichedBonuses = await Promise.all(
      bonuses.map(async (bonus) => {
        const game = await BingoGame.findOne({ gameId: bonus.gameId })
          .populate("userId", "username branch")
          .select(
            "gameId userId winnerCardId prize startedAt finished stakeAmount numberOfPlayers totalStake systemEarnings"
          );
        return {
          ...bonus.toObject(),
          gameId: game || null,
        };
      })
    );

    res.status(200).json({
      message: "Bonuses retrieved successfully",
      bonuses: enrichedBonuses,
    });
  } catch (err) {
    logger.error("Error fetching all bonuses:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllBonusesUnderAgent = async (req, res) => {
  try {
    // Ensure only agents can access this filtered route
    if (!req.user || req.user.role !== "agent") {
      return res.status(403).json({ message: "Access denied" });
    }

    const agentId = req.user.id;

    // Step 1: Get all cashiers registered by this agent
    const cashiers = await User.find({
      role: "cashier",
      registeredBy: agentId,
    }).select("_id");

    const cashierIds = cashiers.map((cashier) => cashier._id);

    if (cashierIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found registered by you" });
    }

    // Step 2: Get bonuses only for those cashiers
    const bonuses = await Bonus.find({ cashierId: { $in: cashierIds } })
      .populate("cashierId", "username branch")
      .populate("houseId", "name")
      .sort({ dateIssued: -1 });

    if (bonuses.length === 0) {
      return res
        .status(200)
        .json({ message: "Bonuses retrieved successfully", bonuses: [] });
    }

    // Step 3: Enrich each bonus with game details
    const enrichedBonuses = await Promise.all(
      bonuses.map(async (bonus) => {
        const game = await BingoGame.findOne({ gameId: bonus.gameId })
          .populate("userId", "username branch")
          .select(
            "gameId userId winnerCardId prize startedAt finished stakeAmount numberOfPlayers totalStake systemEarnings"
          );

        return {
          ...bonus.toObject(),
          gameId: game || null,
        };
      })
    );

    res.status(200).json({
      message: "Bonuses retrieved successfully",
      bonuses: enrichedBonuses,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getLastWinner = async (req, res) => {
  try {
    // Find the most recent game with a winner
    const lastGame = await BingoGame.findOne({
      winnerCardId: { $exists: true, $ne: null },
      finished: true,
    })
      .sort({ startedAt: -1 }) // Most recent game
      .populate("userId", "username branch")
      .populate("houseId", "name")
      .select(
        "gameId winnerCardId prize startedAt stakeAmount numberOfPlayers totalStake systemEarnings finished"
      );

    if (!lastGame) {
      return res.status(404).json({ message: "No games with a winner found" });
    }

    // Find associated bonus, if any
    const bonus = await Bonus.findOne({ gameId: lastGame.gameId })
      .populate("cashierId", "username branch")
      .populate("houseId", "name");

    const response = {
      game: lastGame,
      bonus: bonus || null,
    };

    res
      .status(200)
      .json({ message: "Last winner retrieved successfully", data: response });
  } catch (err) {
    logger.error("Error fetching last winner:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getBonusesByHouse = async (req, res) => {
  try {
    const { houseId } = req.params;

    // Validate houseId
    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      return res.status(400).json({ message: "Invalid houseId" });
    }

    // Check if house exists
    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Fetch bonuses for the specified houseId with populated cashier and house
    const bonuses = await Bonus.find({ houseId })
      .populate("cashierId", "username branch")
      .populate("houseId", "name")
      .sort({ dateIssued: -1 }); // Sort by most recent

    if (!bonuses || bonuses.length === 0) {
      return res
        .status(404)
        .json({ message: "No bonuses found for this house" });
    }

    // Manually fetch game details for each bonus
    const enrichedBonuses = await Promise.all(
      bonuses.map(async (bonus) => {
        const game = await BingoGame.findOne({ gameId: bonus.gameId })
          .populate("userId", "username branch")
          .select(
            "gameId userId winnerCardId prize startedAt finished stakeAmount numberOfPlayers totalStake systemEarnings"
          );
        return {
          ...bonus.toObject(),
          gameId: game || null,
        };
      })
    );

    res.status(200).json({
      message: "Bonuses retrieved successfully",
      bonuses: enrichedBonuses,
    });
  } catch (err) {
    logger.error("Error fetching bonuses by house:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const markBonusInactive = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { houseId, cashierId } = req.body;
    const user = await User.findById(cashierId).session(session);

    if (!user || user.role !== "cashier") {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Only cashiers can mark bonuses as inactive" });
    }

    const collectBonus = await CollectBonus.findOne({
      houseId,
      status: "active",
    }).session(session);
    if (!collectBonus || collectBonus.bonusAmount <= 0) {
      await session.abortTransaction();
      return res.status(404).json({ message: "No active dynamic bonus found" });
    }

    collectBonus.status = "inactive";
    await collectBonus.save({ session });

    const newCollectBonus = new CollectBonus({
      houseId,
      bonusAmount: 0,
      status: "active",
    });
    await newCollectBonus.save({ session });

    await session.commitTransaction();
    res.status(200).json({
      message: "Bonus taken by cashier, new bonus pool created",
      collectBonus: newCollectBonus,
    });
  } catch (err) {
    await session.abortTransaction();

    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    session.endSession();
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
  markBonusInactive,
};
