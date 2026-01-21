const houseService = require("../services/houseService");
const House = require("../models/House");
const Recharge = require("../models/Recharge");
const User = require("../models/User");
const AgentRecharge = require("../models/AgentRecharge");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

const rechargeAgent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { agentId, amount, superAdminCommission } = req.body;

    // Validate input
    if (!agentId || !amount || !superAdminCommission) {
      logger.warn("Missing required fields for agent recharge");
      return res.status(400).json({ message: "All fields are required" });
    }
    if (amount <= 0) {
      logger.warn("Invalid recharge amount");
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (superAdminCommission <= 0) {
      logger.warn("Invalid commission amount");
      return res
        .status(400)
        .json({ message: "Commission must be greater than 0" });
    }

    // Validate agent
    const agent = await User.findById(agentId).session(session);
    if (!agent || agent.role !== "agent") {
      logger.warn(`Invalid or non-agent user: ${agentId}`);
      return res
        .status(404)
        .json({ message: "Agent not found or invalid role" });
    }

    // Calculate package added
    const packageAdded = amount / superAdminCommission;
    logger.debug(
      `Agent ${agentId}: Amount ${amount}, Commission ${superAdminCommission}, Package Added ${packageAdded}`
    );

    // Update agent package
    agent.package = (agent.package || 0) + packageAdded;
    await agent.save({ session });

    // Create recharge record
    const recharge = new AgentRecharge({
      amount,
      packageAdded,
      superAdminCommission,
      agentId,
    });
    await recharge.save({ session });

    await session.commitTransaction();
    logger.info(
      `Agent recharged: ${agentId}, Amount: ${amount}, Package Added: ${packageAdded}`
    );
    res.status(201).json(recharge);
  } catch (err) {
    await session.abortTransaction();
    logger.error(`Agent recharge failed: ${err.message}`);
    res.status(500).json({ message: err.message || "Internal Server Error" });
    next(err);
  } finally {
    session.endSession();
  }
};

const createHouse = async (req, res, next) => {
  try {
    const house = await houseService.createHouse(req.body);
    res.status(201).json({ message: "House created", house });
  } catch (error) {
    next(error);
  }
};

const assignCashier = async (req, res, next) => {
  try {
    const house = await houseService.assignCashier(req.body);
    res.json({ message: "Cashier assigned", house });
  } catch (error) {
    next(error);
  }
};

const rechargeHouse = async (req, res, next) => {
  try {
    const rechargeBy = req.user.id; // Get the user ID from the request
    const recharge = await houseService.rechargeHouse({
      ...req.body,
      rechargeBy,
    });
    res.json({ message: "House recharged", recharge });
  } catch (error) {
    next(error);
  }
};
const updateRecharge = async (req, res, next) => {
  try {
    const recharge = await houseService.updateRecharge(req.body);
    res.json({ message: "Recharge updated", recharge });
  } catch (error) {
    next(error);
  }
};

const getHouse = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const houses = await houseService.getHouses({ page, limit, search });
    res.json({ message: "House fetched", ...houses });
  } catch (error) {
    next(error);
  }
};

const getMyHouse = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "agent") {
      return res.status(403).json({ message: "Access denied" });
    }

    // First, find users (house_admins) registered by this agent
    const houseAdmins = await User.find({
      role: "house_admin",
      registeredBy: req.user.id,
    }).select("_id");

    const houseAdminIds = houseAdmins.map((admin) => admin._id);

    // Then, find houses where houseAdminId is one of those
    const houses = await House.find({ houseAdminId: { $in: houseAdminIds } })
      .populate("houseAdminId")
      .populate("cashierId");

    res.json({ message: "Houses fetched", houses });
  } catch (error) {
    next(error);
  }
};

const getRechargeHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.role || !req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const { role, id: userId } = req.user;
    const { startDate, endDate, page = 1, limit = 10, search = "" } = req.query;
    const query = {};

    // Role-based access restrictions
    if (role === "agent") {
      query.rechargeBy = userId;
    } else if (role === "house_admin") {
      query.houseId = req.user.houseId;
    } else if (role !== "cashier" && role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Date range filtering
    const validStart = startDate && !isNaN(Date.parse(startDate));
    const validEnd = endDate && !isNaN(Date.parse(endDate));
    if (validStart || validEnd) {
      query.createdAt = {};
      if (validStart) query.createdAt.$gte = new Date(startDate);
      if (validEnd) {
        query.createdAt.$lte = new Date(
          new Date(endDate).setHours(23, 59, 59, 999)
        );
      }
      if (validStart && validEnd) {
        const range = new Date(endDate) - new Date(startDate);
        const maxRange = 1000 * 60 * 60 * 24 * 90;
        if (range > maxRange) {
          return res
            .status(400)
            .json({ message: "Date range too large (max 90 days)" });
        }
      }
    }

    // Search filtering
    if (search) {
      query.$or = [
        { "houseId.name": { $regex: search, $options: "i" } },
        { amount: !isNaN(search) ? Number(search) : null },
        { superAdminCommission: !isNaN(search) ? Number(search) / 100 : null },
      ].filter((condition) => condition !== null);
    }

    const recharges = await Recharge.find(query)
      .populate("houseId", "name")
      .select("houseId amount packageAdded superAdminCommission createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Recharge.countDocuments(query);

    res.status(200).json({
      recharges,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const getAgentRechargeHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.role || !req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const { role, id: userId } = req.user;
    const { startDate, endDate } = req.query;
    const query = {};

    // Role-based access restrictions
    if (role === "agent") {
      query.agentId = userId; // Agents see only their own recharges
    } else if (role === "super_admin") {
      // Super admins see all agent recharges
    } else {
      // Deny all other roles (e.g., house_admin, cashier)
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate date range
    const validStart = startDate && !isNaN(Date.parse(startDate));
    const validEnd = endDate && !isNaN(Date.parse(endDate));

    if (validStart || validEnd) {
      query.createdAt = {};
      if (validStart) query.createdAt.$gte = new Date(startDate);
      if (validEnd) {
        query.createdAt.$lte = new Date(
          new Date(endDate).setHours(23, 59, 59, 999)
        );
      }

      // Enforce max date range
      if (validStart && validEnd) {
        const range = new Date(endDate) - new Date(startDate);
        const maxRange = 1000 * 60 * 60 * 24 * 90; // 90 days
        if (range > maxRange) {
          return res
            .status(400)
            .json({ message: "Date range too large (max 90 days)" });
        }
      }
    }

    const recharges = await AgentRecharge.find(query)
      .populate("agentId", "fullname") // Populate agent's name
      .sort({ createdAt: -1 })
      .limit(500);

    res.status(200).json({ recharges });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  createHouse,
  getHouse,
  assignCashier,
  rechargeHouse,
  updateRecharge,
  getRechargeHistory,
  getMyHouse,
  rechargeAgent,
  getAgentRechargeHistory,
};
