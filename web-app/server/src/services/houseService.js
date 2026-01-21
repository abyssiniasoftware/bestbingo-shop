const House = require("../models/House");
const User = require("../models/User");
const Recharge = require("../models/Recharge");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

const createHouse = async ({ name, cashierId, houseAdminId }, session) => {
  // Check for existing house by houseAdminId
  const existingHouse = await House.findOne({ houseAdminId }).session(session);
  if (existingHouse) {
    logger.warn(`House already exists for admin: ${houseAdminId}`);
    throw new Error("House admin already assigned to a house");
  }

  // Check for existing house by cashierId
  const existingCashier = await House.findOne({ cashierId }).session(session);
  if (existingCashier) {
    logger.warn(`House already exists for this cashier: ${cashierId}`);
    throw new Error("This cashier is already assigned to a house");
  }

  // Check for duplicate house name
  const existingHouseByName = await House.findOne({ name }).session(session);
  if (existingHouseByName) {
    logger.warn(`House with name ${name} already exists`);
    throw new Error("House name already exists");
  }

  // Create the house
  const house = new House({ name, cashierId, houseAdminId });
  await house.save({ session });

  // Update the cashier's and house admin's houseId
  await Promise.all([
    User.updateOne({ _id: cashierId }, { houseId: house._id }).session(session),
    User.updateOne({ _id: houseAdminId }, { houseId: house._id }).session(
      session
    ),
  ]);

  logger.info(`House created: ${name}`);
  return house;
};

const assignCashier = async ({ houseId, cashierId }) => {
  const house = await House.findById(houseId);
  if (!house) {
    logger.warn(`House not found: ${houseId}`);
    throw new Error("House not found");
  }
  if (house.cashierId) {
    logger.warn(`House already has a cashier: ${houseId}`);
    throw new Error("House already has a cashier");
  }

  const cashier = await User.findById(cashierId);
  if (!cashier || cashier.role !== "cashier") {
    logger.warn(`Invalid cashier: ${cashierId}`);
    throw new Error("Invalid cashier");
  }

  house.cashierId = cashierId;
  await house.save();
  await User.findByIdAndUpdate(cashierId, {
    houseId,
    package: (await User.findById(house.houseAdminId)).package,
  });
  logger.info(`Cashier assigned to house: ${houseId}`);
  return house;
};

const rechargeHouse = async ({
  houseId,
  amount,
  superAdminCommission,
  rechargeBy,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Validate input
    if (!houseId || !amount || !superAdminCommission || !rechargeBy) {
      logger.warn("Missing required fields for house recharge");
      throw new Error("All fields are required");
    }
    if (amount <= 0) {
      logger.warn("Invalid recharge amount");
      throw new Error("Amount must be greater than 0");
    }
    if (superAdminCommission <= 0) {
      logger.warn("Invalid commission amount");
      throw new Error("Commission must be greater than 0");
    }

    // Validate house
    const house = await House.findById(houseId).session(session);
    if (!house) {
      logger.warn(`House not found for recharge: ${houseId}`);
      throw new Error("House not found");
    }

    // Validate recharger
    const recharger = await User.findById(rechargeBy).session(session);
    if (!recharger || !["agent", "super_admin"].includes(recharger.role)) {
      logger.warn(`Invalid or unauthorized recharger: ${rechargeBy}`);
      throw new Error("Invalid or unauthorized user");
    }

    // Calculate package added
    const packageAdded = amount / superAdminCommission;
    logger.debug(
      `House ${houseId}: Amount ${amount}, Commission ${superAdminCommission}, Package Added ${packageAdded}`
    );

    // Check balance and deduct for agents
    if (recharger.role === "agent") {
      const currentBalance = recharger.package || 0;
      if (currentBalance < packageAdded) {
        logger.warn(
          `Insufficient balance for agent ${rechargeBy}: ${currentBalance} < ${packageAdded}`
        );
        throw new Error(
          `dear ${recharger.username} your balance is Insufficient`
        );
      }
      recharger.package -= packageAdded;
      await recharger.save({ session });
    }

    // Update house admin and cashier packages
    const houseAdmin = await User.findById(house.houseAdminId).session(session);
    if (!houseAdmin) {
      logger.warn(`House admin not found: ${house.houseAdminId}`);
      throw new Error("House admin not found");
    }
    houseAdmin.package += packageAdded;
    await houseAdmin.save({ session });

    const cashier = await User.findById(house.cashierId).session(session);
    if (cashier) {
      cashier.package = houseAdmin.package;
      await cashier.save({ session });
    }

    // Create recharge record
    const recharge = new Recharge({
      houseId,
      amount,
      packageAdded,
      superAdminCommission,
      rechargeBy,
    });
    await recharge.save({ session });

    await session.commitTransaction();
    logger.info(
      `House recharged: ${houseId}, Amount: ${amount}, Package Added: ${packageAdded}, Recharged By: ${rechargeBy}`
    );
    return recharge;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`House recharge failed: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

const updateRecharge = async ({ rechargeId, amount, superAdminCommission }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const recharge = await Recharge.findById(rechargeId).session(session);
    if (!recharge) {
      logger.warn(`Recharge not found: ${rechargeId}`);
      throw new Error("Recharge not found");
    }

    const house = await House.findById(recharge.houseId).session(session);
    if (!house) {
      logger.warn(`House not found for recharge: ${recharge.houseId}`);
      throw new Error("House not found");
    }

    const oldPackageAdded = recharge.packageAdded;
    const newPackageAdded = amount / superAdminCommission;
    const packageDifference = newPackageAdded - oldPackageAdded;

    const houseAdmin = await User.findById(house.houseAdminId).session(session);
    const cashier = house.cashierId
      ? await User.findById(house.cashierId).session(session)
      : null;

    // Update house admin's package
    houseAdmin.package += packageDifference;
    if (houseAdmin.package < 0) {
      throw new Error("Insufficient balance for house admin after update");
    }

    // Update cashier's package if exists
    if (cashier) {
      cashier.package = houseAdmin.package;
      if (cashier.package < 0) {
        throw new Error("Insufficient balance for cashier after update");
      }
    }

    // Update recharge record
    recharge.amount = amount;
    recharge.packageAdded = newPackageAdded;
    recharge.superAdminCommission = superAdminCommission;
    recharge.updatedAt = new Date();

    await Promise.all([
      houseAdmin.save({ session }),
      cashier ? cashier.save({ session }) : Promise.resolve(),
      recharge.save({ session }),
    ]);

    await session.commitTransaction();
    logger.info(
      `Recharge updated: ${rechargeId}, New Amount: ${amount}, New Package Added: ${newPackageAdded}`
    );
    return recharge;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Recharge update failed: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};
const getHouses = async ({ page = 1, limit = 10, search = "" }) => {
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "houseAdminId.fullname": { $regex: search, $options: "i" } },
          { "houseAdminId.username": { $regex: search, $options: "i" } },
          { "houseAdminId.phone": { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const houses = await House.find(query)
    .populate("houseAdminId") // Populate full houseAdmin user info
    .populate("cashierId") // Populate full cashier user info (if any)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await House.countDocuments(query);

  return {
    houses,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = {
  createHouse,
  assignCashier,
  rechargeHouse,
  updateRecharge,
  getHouses,
};
