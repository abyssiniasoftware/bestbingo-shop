const authService = require('../services/authService');
const houseService = require('../services/houseService');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const { username, password, branch, phone } = req.body;
    const registeredBy = req.user.id;
    const { cashier, houseAdmin } = await authService.registerWithHouseAdmin({
      username,
      password,
      branch,
      phone,
      registeredBy
    });

    const house = await houseService.createHouse({
      name: branch,
      cashierId: cashier._id,
      houseAdminId: houseAdmin._id
    });

    logger.info(`Registered cashier ${cashier._id} and house admin ${houseAdmin._id} with house ${house._id}`);
    res.status(201).json({
      message: 'Users and house registered successfully',
      users: [
        { id: cashier._id, role: cashier.role, username: cashier.username },
        { id: houseAdmin._id, role: houseAdmin.role, username: houseAdmin.username }
      ],
      house: { id: house._id, name: house.name }
    });
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 'duplicate_key') {
      const field = error.field || 'unknown';
      return res.status(409).json({ message: `${field} already exists` });
    }
    if (error.message.includes('House')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    logger.info(`Registered admin user: ${user._id}`);
    res.status(201).json({
      message: 'User registered',
      user: { id: user._id, role: user.role }
    });
  } catch (error) {
    logger.error(`Register admin error: ${error.message}`);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 'duplicate_key') {
      const field = error.field || 'unknown';
      return res.status(409).json({ message: `${field} already exists` });
    }
    if (error.statusCode && error.message) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const registerAgent = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      logger.warn(`Access denied for non-super_admin: ${req.user.id}`);
      throw new Error('Only super admins can register agents');
    }

    const { username, password, fullname, address, phone } = req.body;
    const registeredBy = req.user.id;

    const agent = await authService.registerAgent({
      username,
      password,
      fullname,
      address,
      phone,
      registeredBy
    });

    logger.info(`Registered agent: ${agent._id}`);
    res.status(201).json({
      message: 'Agent registered successfully',
      user: { id: agent._id, role: agent.role, username: agent.username }
    });
  } catch (error) {
    logger.error(`Register agent error: ${error.message}`);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 'duplicate_key') {
      const field = error.field || 'unknown';
      return res.status(409).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const login = async (req, res, next) => {
  try {
    const { token, role, id, houseId, package: userPackage } = await authService.login(req.body);
    logger.info(`User logged in: ${id}`);
    res.json({ token, role, id, houseId, package: userPackage });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

module.exports = { register, login, registerAdmin, registerAgent };