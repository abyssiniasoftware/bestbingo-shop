const House = require('../models/House');
const User = require('../models/User');
const Recharge = require('../models/Recharge');
const logger = require('../utils/logger');

const createHouse = async ({ name, cashierId, houseAdminId }) => {
  const existingHouse = await House.findOne({ houseAdminId });
  if (existingHouse) {
    logger.warn(`House already exists for admin: ${houseAdminId}`);
    throw new Error('House admin already assigned to a house');
  }

  const existingCashier = await House.findOne({ cashierId });
  if (existingCashier) {
    logger.warn(`House already exists for this cashier: ${cashierId}`);
    throw new Error('This cashier is already assigned to a house');
  }

  const existingHouseByName = await House.findOne({ name });
  if (existingHouseByName) {
    logger.warn(`House with name ${name} already exists`);
    throw new Error('House name already exists');
  }

  const house = await House.insert({ name, cashierId, houseAdminId });

  await Promise.all([
    User.updateOne({ _id: cashierId }, { houseId: house._id }),
    User.updateOne({ _id: houseAdminId }, { houseId: house._id })
  ]);

  logger.info(`House created: ${name}`);
  return house;
};

const assignCashier = async ({ houseId, cashierId }) => {
  const house = await House.findOne({ _id: houseId });
  if (!house) {
    logger.warn(`House not found: ${houseId}`);
    throw new Error('House not found');
  }
  if (house.cashierId) {
    logger.warn(`House already has a cashier: ${houseId}`);
    throw new Error('House already has a cashier');
  }

  const cashier = await User.findOne({ _id: cashierId });
  if (!cashier || cashier.role !== 'cashier') {
    logger.warn(`Invalid cashier: ${cashierId}`);
    throw new Error('Invalid cashier');
  }

  await House.updateOne({ _id: houseId }, { cashierId });
  const houseAdmin = await User.findOne({ _id: house.houseAdminId });
  await User.updateOne({ _id: cashierId }, { houseId, package: houseAdmin.package });
  logger.info(`Cashier assigned to house: ${houseId}`);
  return await House.findOne({ _id: houseId });
};

const rechargeHouse = async ({ houseId, amount, superAdminCommission, rechargeBy }) => {
  try {
    if (!houseId || !amount || !superAdminCommission || !rechargeBy) {
      logger.warn('Missing required fields for house recharge');
      throw new Error('All fields are required');
    }
    if (amount <= 0) {
      logger.warn('Invalid recharge amount');
      throw new Error('Amount must be greater than 0');
    }
    if (superAdminCommission <= 0) {
      logger.warn('Invalid commission amount');
      throw new Error('Commission must be greater than 0');
    }

    const house = await House.findOne({ _id: houseId });
    if (!house) {
      logger.warn(`House not found for recharge: ${houseId}`);
      throw new Error('House not found');
    }

    const recharger = await User.findOne({ _id: rechargeBy });
    if (!recharger || !['agent', 'super_admin'].includes(recharger.role)) {
      logger.warn(`Invalid or unauthorized recharger: ${rechargeBy}`);
      throw new Error('Invalid or unauthorized user');
    }

    const packageAdded = amount / superAdminCommission;
    logger.debug(`House ${houseId}: Amount ${amount}, Commission ${superAdminCommission}, Package Added ${packageAdded}`);

    if (recharger.role === 'agent') {
      const currentBalance = recharger.package || 0;
      if (currentBalance < packageAdded) {
        logger.warn(`Insufficient balance for agent ${rechargeBy}: ${currentBalance} < ${packageAdded}`);
        throw new Error(`dear ${recharger.username} your balance is Insufficient`);
      }
      await User.updateOne({ _id: rechargeBy }, { package: currentBalance - packageAdded });
    }

    const houseAdmin = await User.findOne({ _id: house.houseAdminId });
    if (!houseAdmin) {
      logger.warn(`House admin not found: ${house.houseAdminId}`);
      throw new Error('House admin not found');
    }
    await User.updateOne({ _id: houseAdmin._id }, { package: houseAdmin.package + packageAdded });

    const cashier = house.cashierId ? await User.findOne({ _id: house.cashierId }) : null;
    if (cashier) {
      await User.updateOne({ _id: cashier._id }, { package: houseAdmin.package + packageAdded });
    }

    const recharge = await Recharge.insert({
      houseId,
      amount,
      packageAdded,
      superAdminCommission,
      rechargeBy
    });

    logger.info(`House recharged: ${houseId}, Amount: ${amount}, Package Added: ${packageAdded}, Recharged By: ${rechargeBy}`);
    return recharge;
  } catch (error) {
    logger.error(`House recharge failed: ${error.message}`);
    throw error;
  }
};

const updateRecharge = async ({ rechargeId, amount, superAdminCommission }) => {
  try {
    const recharge = await Recharge.findOne({ _id: rechargeId });
    if (!recharge) {
      logger.warn(`Recharge not found: ${rechargeId}`);
      throw new Error('Recharge not found');
    }

    const house = await House.findOne({ _id: recharge.houseId });
    if (!house) {
      logger.warn(`House not found for recharge: ${recharge.houseId}`);
      throw new Error('House not found');
    }

    const oldPackageAdded = recharge.packageAdded;
    const newPackageAdded = amount / superAdminCommission;
    const packageDifference = newPackageAdded - oldPackageAdded;

    const houseAdmin = await User.findOne({ _id: house.houseAdminId });
    const cashier = house.cashierId ? await User.findOne({ _id: house.cashierId }) : null;

    const newHouseAdminPackage = houseAdmin.package + packageDifference;
    if (newHouseAdminPackage < 0) {
      throw new Error('Insufficient balance for house admin after update');
    }

    await User.updateOne({ _id: houseAdmin._id }, { package: newHouseAdminPackage });

    if (cashier) {
      const newCashierPackage = newHouseAdminPackage;
      if (newCashierPackage < 0) {
        throw new Error('Insufficient balance for cashier after update');
      }
      await User.updateOne({ _id: cashier._id }, { package: newCashierPackage });
    }

    await Recharge.updateOne({ _id: rechargeId }, {
      amount,
      packageAdded: newPackageAdded,
      superAdminCommission,
      updatedAt: new Date()
    });

    logger.info(`Recharge updated: ${rechargeId}, New Amount: ${amount}, New Package Added: ${newPackageAdded}`);
    return await Recharge.findOne({ _id: rechargeId });
  } catch (error) {
    logger.error(`Recharge update failed: ${error.message}`);
    throw error;
  }
};

const getHouses = async ({ page = 1, limit = 10, search = '' }) => {
  const query = search
    ? {
        $or: [
          { name: new RegExp(search, 'i') }
        ]
      }
    : {};

  return new Promise(async (resolve, reject) => {
    try {
      const houses = await House.find(query);
      const total = houses.length;
      const paginatedHouses = houses.slice((page - 1) * limit, page * limit);

      const populatedHouses = await Promise.all(paginatedHouses.map(async (house) => {
        const houseAdmin = await User.findOne({ _id: house.houseAdminId });
        const cashier = house.cashierId ? await User.findOne({ _id: house.cashierId }) : null;
        if (search && houseAdmin) {
          if (
            !new RegExp(search, 'i').test(houseAdmin.fullname) &&
            !new RegExp(search, 'i').test(houseAdmin.username) &&
            !new RegExp(search, 'i').test(houseAdmin.phone)
          ) {
            return null;
          }
        }
        return { ...house, houseAdminId: houseAdmin, cashierId: cashier };
      }));

      const filteredHouses = populatedHouses.filter(house => house !== null);

      resolve({
        houses: filteredHouses,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  createHouse,
  assignCashier,
  rechargeHouse,
  updateRecharge,
  getHouses
};