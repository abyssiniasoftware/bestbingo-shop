const User = require("../models/User");
const BingoGame = require("../models/BingoGame");
const logger = require("../utils/logger");

const getUsers = async ({ page = 1, limit = 10, search = "" }) => {
  const query = search
    ? {
        $or: [
          { fullname: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(query)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments(query);

  return {
    users,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    logger.warn(`User not found: ${id}`);
    throw new Error("User not found");
  }
  return user;
};

const updateUser = async (id, updates) => {
  if (updates.password) {
    updates.password = await require("bcrypt").hash(updates.password, 10);
  }
  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");
  if (!user) {
    logger.warn(`User not found for update: ${id}`);
    throw new Error("User not found");
  }
  logger.info(`User updated: ${id}`);
  return user;
};

const updateUserPassword = async (id, updates) => {
  if (updates.password) {
    updates.password = await require("bcrypt").hash(updates.password, 10);
  }
  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");
  if (!user) {
    logger.warn(`User not found for update: ${id}`);
    throw new Error("User not found");
  }
  logger.info(`User updated: ${id}`);
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    logger.warn(`User not found for deletion: ${id}`);
    throw new Error("User not found");
  }
  logger.info(`User deleted: ${id}`);
  return user;
};

const banUser = async (id, bannedBy) => {
  const user = await User.findById(id);
  if (!user) {
    logger.warn(`User not found for ban: ${id}`);
    throw new Error("User not found");
  }
  user.isBanned = !user.isBanned;
  user.bannedBy = user.isBanned ? bannedBy : "";
  await user.save();
  logger.info(`User ${user.isBanned ? "banned" : "unbanned"}: ${id}`);
  return user;
};

const getUsersByRole = async ({ role, page = 1, limit = 10, search = "" }) => {
  const query = {
    role,
    ...(search && {
      $or: [
        { fullname: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const users = await User.find(query)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments(query);

  return {
    users,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

const getUsersByHouseAdmin = async (houseAdminId) => {
  return User.find({ houseId: houseAdminId, role: "cashier" }).select(
    "-password"
  );
};

const getUsersByAgent = async (agentId) => {
  return User.find({ registeredBy: agentId }).select("-password");
};
const updateDynamicBonus = async (
  id,
  enableDynamicBonus,
  requestingUserRole
) => {
  if (typeof enableDynamicBonus !== "boolean") {
    throw new Error("enableDynamicBonus must be a boolean");
  }

  const user = await User.findById(id);
  if (!user) {
    logger.warn(`User not found for dynamic bonus update: ${id}`);
    throw new Error("User not found");
  }

  // Authorization check
  if (user.role !== "cashier" && requestingUserRole !== "super_admin") {
    logger.warn(
      `Unauthorized attempt to update user: ${id} by role: ${requestingUserRole}`
    );
    throw new Error("Unauthorized to update this user");
  }

  user.enableDynamicBonus = enableDynamicBonus;
  await user.save();
  logger.info(
    `Dynamic bonus updated for user: ${id}, set to: ${enableDynamicBonus}`
  );
  return user;
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
  updateUserPassword,
};
