const houseService = require('../services/houseService');
const House = require('../models/House');
const Recharge = require('../models/Recharge');
const User = require('../models/User');
const AgentRecharge = require('../models/AgentRecharge');
const logger = require('../utils/logger');

const rechargeAgent = async (req, res, next) => {
  try {
    const { agentId, amount, superAdminCommission } = req.body;

    if (!agentId || !amount || !superAdminCommission) {
      logger.warn('Missing required fields for agent recharge');
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (amount <= 0) {
      logger.warn('Invalid recharge amount');
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    if (superAdminCommission <= 0) {
      logger.warn('Invalid commission amount');
      return res.status(400).json({ message: 'Commission must be greater than 0' });
    }

    const agent = await User.findOne({ _id: agentId });
    if (!agent || agent.role !== 'agent') {
      logger.warn(`Invalid or non-agent user: ${agentId}`);
      return res.status(404).json({ message: 'Agent not found or invalid role' });
    }

    const packageAdded = amount / superAdminCommission;
    logger.debug(`Agent ${agentId}: Amount ${amount}, Commission ${superAdminCommission}, Package Added ${packageAdded}`);

    agent.package = (agent.package || 0) + packageAdded;
    await User.updateOne({ _id: agentId }, { package: agent.package });

    const recharge = await AgentRecharge.insert({
      amount,
      packageAdded,
      superAdminCommission,
      agentId
    });

    logger.info(`Agent recharged: ${agentId}, Amount: ${amount}, Package Added: ${packageAdded}`);
    res.status(201).json(recharge);
  } catch (err) {
    logger.error(`Agent recharge failed: ${err.message}`);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
    next(err);
  }
};

const createHouse = async (req, res, next) => {
  try {
    const house = await houseService.createHouse(req.body);
    res.status(201).json({ message: 'House created', house });
  } catch (error) {
    next(error);
  }
};

const assignCashier = async (req, res, next) => {
  try {
    const house = await houseService.assignCashier(req.body);
    res.json({ message: 'Cashier assigned', house });
  } catch (error) {
    next(error);
  }
};

const rechargeHouse = async (req, res, next) => {
  try {
    const rechargeBy = req.user.id;
    const recharge = await houseService.rechargeHouse({ ...req.body, rechargeBy });
    res.json({ message: 'House recharged', recharge });
  } catch (error) {
    next(error);
  }
};

const updateRecharge = async (req, res, next) => {
  try {
    const recharge = await houseService.updateRecharge(req.body);
    res.json({ message: 'Recharge updated', recharge });
  } catch (error) {
    next(error);
  }
};

const getHouse = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    logger.info('getHouse called with:', { page, limit, search });
    const houses = await houseService.getHouses({ page, limit, search });
    logger.info('houseService.getHouses result keys:', Object.keys(houses || {}));
    if (!houses || !houses.houses) {
      logger.error('houseService.getHouses returned invalid structure:', houses);
    }
    res.json({ message: 'House fetched', ...houses });
  } catch (error) {
    next(error);
  }
};

const getMyHouse = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'agent') {
      logger.warn('Access denied for non-agent user');
      return res.status(403).json({ message: 'Access denied' });
    }

    const houseAdmins = await User.find({ role: 'house_admin', registeredBy: req.user.id });
    const houseAdminIds = houseAdmins.map(admin => admin._id);

    const houses = await House.find({ houseAdminId: { $in: houseAdminIds } });
    const populatedHouses = await Promise.all(
      houses.map(async house => {
        const [houseAdmin, cashier] = await Promise.all([
          User.findOne({ _id: house.houseAdminId }),
          User.findOne({ _id: house.cashierId })
        ]);
        return { ...house, houseAdminId: houseAdmin, cashierId: cashier };
      })
    );

    logger.info(`Fetched houses for agent: ${req.user.id}`);
    res.json({ message: 'Houses fetched', houses: populatedHouses });
  } catch (error) {
    logger.error(`Error fetching houses: ${error.message}`);
    next(error);
  }
};

const getRechargeHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.role || !req.user.id) {
      logger.warn('Unauthorized access attempt for recharge history');
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const { role, id: userId } = req.user;
    const { startDate, endDate, page = 1, limit = 10, search = '' } = req.query;
    const query = {};

    if (role === 'agent') {
      query.rechargeBy = userId;
    } else if (role === 'house_admin') {
      query.houseId = req.user.houseId;
    } else if (role !== 'cashier' && role !== 'super_admin') {
      logger.warn(`Access denied for role: ${role}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    const validStart = startDate && !isNaN(Date.parse(startDate));
    const validEnd = endDate && !isNaN(Date.parse(endDate));
    if (validStart || validEnd) {
      query.createdAt = {};
      if (validStart) query.createdAt.$gte = new Date(startDate);
      if (validEnd) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      if (validStart && validEnd) {
        const range = new Date(endDate) - new Date(startDate);
        const maxRange = 1000 * 60 * 60 * 24 * 90;
        if (range > maxRange) {
          logger.warn('Date range too large for recharge history');
          return res.status(400).json({ message: 'Date range too large (max 90 days)' });
        }
      }
    }

    if (search) {
      query.$or = [
        { amount: !isNaN(search) ? Number(search) : null },
        { superAdminCommission: !isNaN(search) ? Number(search) / 100 : null }
      ].filter(condition => condition !== null);
    }

    const recharges = await Recharge.find(query);
    const houses = await House.find({ _id: { $in: recharges.map(r => r.houseId).filter(Boolean) } });

    const populatedRecharges = recharges
      .map(recharge => {
        const house = houses.find(h => h._id.toString() === recharge.houseId?.toString());
        return {
          houseId: house ? { _id: house._id, name: house.name } : null,
          amount: recharge.amount,
          packageAdded: recharge.packageAdded,
          superAdminCommission: recharge.superAdminCommission,
          createdAt: recharge.createdAt
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, page * limit);

    const total = recharges.length;

    logger.info(`Fetched recharge history for user: ${userId}`);
    res.status(200).json({
      recharges: populatedRecharges,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    logger.error(`Error fetching recharge history: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAgentRechargeHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.role || !req.user.id) {
      logger.warn('Unauthorized access attempt for agent recharge history');
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const { role, id: userId } = req.user;
    const { startDate, endDate } = req.query;
    const query = {};

    if (role === 'agent') {
      query.agentId = userId;
    } else if (role !== 'super_admin') {
      logger.warn(`Access denied for role: ${role}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    const validStart = startDate && !isNaN(Date.parse(startDate));
    const validEnd = endDate && !isNaN(Date.parse(endDate));
    if (validStart || validEnd) {
      query.createdAt = {};
      if (validStart) query.createdAt.$gte = new Date(startDate);
      if (validEnd) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      if (validStart && validEnd) {
        const range = new Date(endDate) - new Date(startDate);
        const maxRange = 1000 * 60 * 60 * 24 * 90;
        if (range > maxRange) {
          logger.warn('Date range too large for agent recharge history');
          return res.status(400).json({ message: 'Date range too large (max 90 days)' });
        }
      }
    }

    const recharges = await AgentRecharge.find(query);
    const agents = await User.find({ _id: { $in: recharges.map(r => r.agentId).filter(Boolean) } });

    const populatedRecharges = recharges
      .map(recharge => {
        const agent = agents.find(a => a._id.toString() === recharge.agentId?.toString());
        return {
          ...recharge,
          agentId: agent ? { _id: agent._id, fullname: agent.fullname } : null
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 500);

    logger.info(`Fetched agent recharge history for user: ${userId}`);
    res.status(200).json({ recharges: populatedRecharges });
  } catch (error) {
    logger.error(`Error fetching agent recharge history: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
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
  getAgentRechargeHistory
};