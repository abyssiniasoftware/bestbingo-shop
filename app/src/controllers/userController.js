const userService = require("../services/userService");
const BingoCard = require("../models/BingoCard");

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
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
    res.json({ message: "User updated", user });
  } catch (error) {
    next(error);
  }
};
const updateUserPassword = async (req, res, next) => {
  try {
    const user = await userService.updateUserPassword(req.params.id, req.body);
    res.json({ message: "User updated", user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    if (req.user.role !== "super_admin" && req.user.role !== "agent") {
      return res.status(403).json({ message: "Access denied" });
    }
    const user = await userService.banUser(req.params.id, req.body.bannedBy);
    res.json({
      message: `User ${user.isBanned ? "banned" : "unbanned"}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getUsersByRole = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const role = req.params.role;
    const users = await userService.getUsersByRole({
      role,
      page,
      limit,
      search,
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUsersByHouseAdmin = async (req, res, next) => {
  try {
    const users = await userService.getUsersByHouseAdmin(
      req.params.houseAdminId
    );
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
    const cardsData = req.body; // Assuming req.body is an array of objects
    // Create an array to store promises for saving each Bingo card
    const savePromises = [];

    if (!Array.isArray(cardsData)) {
      return res
        .status(400)
        .json({ message: "Invalid data format. Expected an array of cards." });
    }

    // Iterate through each card data and create/save BingoCard instances
    cardsData.forEach((card) => {
      const bingoCard = new BingoCard(card);
      savePromises.push(bingoCard.save());
    });

    // Wait for all save operations to complete
    const savedCards = await Promise.all(savePromises);

    // Send a JSON response with the newly created Bingo cards
    res.status(201).json(savedCards);
  } catch (err) {
    // Handle errors

    res.status(500).json({ message: "Internal Server Error" });
  }
};
const bulkUploadCards = async (req, res, next) => {
  try {
    const { userId, cardsData } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Delete all existing cards for the user
    await BingoCard.deleteMany({ userId });
    // Create an array to store promises for saving each Bingo card
    const savePromises = [];

    if (!Array.isArray(cardsData)) {
      return res
        .status(400)
        .json({ message: "Invalid data format. Expected an array of cards." });
    }

    // Iterate through each card data and create/save BingoCard instances
    cardsData.forEach((card) => {
      const bingoCard = new BingoCard(card);
      savePromises.push(bingoCard.save());
    });

    // Wait for all save operations to complete
    const savedCards = await Promise.all(savePromises);

    // Send a JSON response with the newly created Bingo cards
    res.status(201).json(savedCards);
  } catch (err) {
    // Handle errors

    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userCards = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Optional: Restrict access to user's own cards
    // if (req.user.userId !== userId) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    const cards = await BingoCard.find({ userId });
    if (!cards || cards.length === 0) {
      return res
        .status(404)
        .json({ message: "No bingo cards found for this user" });
    }

    res.status(200).json({ message: "Bingo cards fetched", cards });
  } catch (error) {
    next(error);
  }
};

const userCardById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const cardId = req.params.cardId;

    // Optional: Restrict access to user's own cards
    // if (req.user.userId !== userId) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    const cards = await BingoCard.find({ userId, cardId });
    if (!cards || cards.length === 0) {
      return res
        .status(404)
        .json({ message: "No bingo cards found for this user" });
    }

    res.status(200).json({ message: "Bingo cards fetched", cards });
  } catch (error) {
    next(error);
  }
};
const getCashiers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const cashiers = await userService.getUsersByRole({
      role: "cashier",
      page,
      limit,
      search,
    });
    res.json(cashiers);
  } catch (error) {
    next(error);
  }
};
const updateDynamicBonus = async (req, res, next) => {
  try {
    const { enableDynamicBonus } = req.body;
    const user = await userService.updateDynamicBonus(
      req.params.id,
      enableDynamicBonus,
      req.user.role
    );
    res.json({ message: "Dynamic bonus updated", user });
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
  updateUserPassword,
};
