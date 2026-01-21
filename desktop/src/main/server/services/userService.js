const db = require('../config/db');
const User = require('../models/User');
const BingoGame = require('../models/BingoGame');
const logger = require('../utils/logger');
const CryptoJS = require('crypto-js');

const getUsers = async ({ page = 1, limit = 10, search = '' }) => {
  const query = search
    ? {
        $or: [
          { fullname: new RegExp(search, 'i') },
          { username: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') },
          { address: new RegExp(search, 'i') }
        ]
      }
    : {};

  return new Promise((resolve, reject) => {
    db.users.find(query, (err, docs) => {
      if (err) return reject(err);
      const total = docs.length;
      const users = docs
        .slice((page - 1) * limit, page * limit)
        .map(user => {
          const { password, ...rest } = user;
          rest.phone = CryptoJS.AES.decrypt(rest.phone, 'classicBingoSecret').toString(CryptoJS.enc.Utf8);
          rest.address = CryptoJS.AES.decrypt(rest.address, 'classicBingoSecret').toString(CryptoJS.enc.Utf8);
          return rest;
        });

      resolve({
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      });
    });
  });
};

const getUserById = async (id) => {
  const user = await User.findOne({ _id: id });
  if (!user) {
    logger.warn(`User not found: ${id}`);
    throw new Error('User not found');
  }
  const { password, ...rest } = user;
  return rest;
};

const updateUser = async (id, updates) => {
  if (updates.password) {
    updates.password = await require('bcryptjs').hash(updates.password, 10);
  }
  if (updates.phone) {
    updates.phone = CryptoJS.AES.encrypt(updates.phone, 'classicBingoSecret').toString();
  }
  if (updates.address) {
    updates.address = CryptoJS.AES.encrypt(updates.address, 'classicBingoSecret').toString();
  }
  const num = await User.updateOne({ _id: id }, updates);
  if (num === 0) {
    logger.warn(`User not found for update: ${id}`);
    throw new Error('User not found');
  }
  const user = await User.findOne({ _id: id });
  const { password, ...rest } = user;
  logger.info(`User updated: ${id}`);
  return rest;
};

const updateUserPassword = async (id, updates) => {
  if (updates.password) {
    updates.password = await require('bcryptjs').hash(updates.password, 10);
  }
  const num = await User.updateOne({ _id: id }, updates);
  if (num === 0) {
    logger.warn(`User not found for update: ${id}`);
    throw new Error('User not found');
  }
  const user = await User.findOne({ _id: id });
  const { password, ...rest } = user;
  logger.info(`User updated: ${id}`);
  return rest;
};

const deleteUser = async (id) => {
  return new Promise((resolve, reject) => {
    db.users.remove({ _id: id }, {}, (err, num) => {
      if (err) reject(err);
      if (num === 0) {
        logger.warn(`User not found for deletion: ${id}`);
        throw new Error('User not found');
      }
      logger.info(`User deleted: ${id}`);
      resolve({ _id: id });
    });
  });
};

const banUser = async (id, bannedBy) => {
  const user = await User.findOne({ _id: id });
  if (!user) {
    logger.warn(`User not found for ban: ${id}`);
    throw new Error('User not found');
  }
  const updates = {
    isBanned: !user.isBanned,
    bannedBy: !user.isBanned ? bannedBy : ''
  };
  await User.updateOne({ _id: id }, updates);
  const updatedUser = await User.findOne({ _id: id });
  logger.info(`User ${updatedUser.isBanned ? 'banned' : 'unbanned'}: ${id}`);
  const { password, ...rest } = updatedUser;
  return rest;
};

const getUsersByRole = async ({ role, page = 1, limit = 10, search = '' }) => {
  const query = {
    role,
    ...(search && {
      $or: [
        { fullname: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') }
      ]
    })
  };

  return new Promise((resolve, reject) => {
    db.users.find(query, (err, docs) => {
      if (err) return reject(err);
      const total = docs.length;
      const users = docs
        .slice((page - 1) * limit, page * limit)
        .map(user => {
          const { password, ...rest } = user;
          rest.phone = CryptoJS.AES.decrypt(rest.phone, 'classicBingoSecret').toString(CryptoJS.enc.Utf8);
          rest.address = CryptoJS.AES.decrypt(rest.address, 'classicBingoSecret').toString(CryptoJS.enc.Utf8);
          return rest;
        });

      resolve({
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      });
    });
  });
};

const getUsersByHouseAdmin = async (houseAdminId) => {
  const users = await User.find({ houseId: houseAdminId, role: 'cashier' });
  return users.map(user => {
    const { password, ...rest } = user;
    return rest;
  });
};

const getUsersByAgent = async (agentId) => {
  const users = await User.find({ registeredBy: agentId });
  return users.map(user => {
    const { password, ...rest } = user;
    return rest;
  });
};

const updateDynamicBonus = async (id, enableDynamicBonus, requestingUserRole) => {
  if (typeof enableDynamicBonus !== 'boolean') {
    throw new Error('enableDynamicBonus must be a boolean');
  }

  const user = await User.findOne({ _id: id });
  if (!user) {
    logger.warn(`User not found for dynamic bonus update: ${id}`);
    throw new Error('User not found');
  }

  if (user.role !== 'cashier' && requestingUserRole !== 'super_admin') {
    logger.warn(`Unauthorized attempt to update user: ${id} by role: ${requestingUserRole}`);
    throw new Error('Unauthorized to update this user');
  }

  await User.updateOne({ _id: id }, { enableDynamicBonus });
  const updatedUser = await User.findOne({ _id: id });
  logger.info(`Dynamic bonus updated for user: ${id}, set to: ${enableDynamicBonus}`);
  const { password, ...rest } = updatedUser;
  return rest;
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateDynamicBonus,
  deleteUser,
  banUser,
  getUsersByRole,
  getUsersByHouseAdmin,
  getUsersByAgent,
  updateUserPassword
};