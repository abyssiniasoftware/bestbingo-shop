const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const register = async (
  { username, password, role, fullname, address, phone, branch, registeredBy },
  session
) => {
  const existingUser = await User.findOne({ username }).session(session);
  if (existingUser) {
    logger.warn(`Registration attempt with existing username: ${username}`);
    throw new Error("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    password: hashedPassword,
    role,
    fullname,
    address,
    phone,
    branch,
    package: role === "house_admin" ? 0 : undefined,
    registeredBy: role !== "super_admin" ? registeredBy : undefined,
  });

  await user.save({ session });
  logger.info(`User registered: ${username}`);
  return user;
};

const registerWithHouseAdmin = async (
  { username, password, branch, phone, registeredBy },
  session
) => {
  const branchFirstPart = branch.split(" ")[0];

  const cashierUser = await register(
    {
      username: `${username}.${branchFirstPart}`,
      password,
      role: "cashier",
      fullname: `${username} cashier`,
      address: branch,
      branch,
      package: undefined,
      registeredBy,
    },
    session
  );

  const houseAdminUser = await register(
    {
      username,
      password,
      role: "house_admin",
      fullname: username,
      address: branch,
      phone: phone,
      branch,
      package: 0,
      registeredBy,
    },
    session
  );

  return { cashier: cashierUser, houseAdmin: houseAdminUser };
};

const registerAgent = async (
  { username, password, fullname, address, phone, registeredBy },
  session
) => {
  return await register(
    {
      username,
      password,
      role: "agent",
      fullname,
      address,
      phone,
      registeredBy,
    },
    session
  );
};

const login = async ({ username, password }) => {
  const user = await User.findOne({ username });
  if (!user) {
    logger.warn(`Login attempt with invalid username: ${username}`);
    throw new Error("user not found");
  }
  if (user.isBanned) {
    logger.warn(`Banned user login attempt: ${username}`);
    throw new Error("User is banned");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    logger.warn(`Invalid password attempt for user: ${username}`);
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      houseId: user.houseId,
      package: user.package,
      enableDynamicBonus: user.enableDynamicBonus,
      registeredBy: user.registeredBy,
      branch: user.branch,
      isBanned: user.isBanned,
    },
    process.env.JWTPRIVATEKEY,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  logger.info(`User logged in: ${username}`);
  return {
    token,
    role: user.role,
    id: user._id,
    houseId: user.houseId,
    package: user.package,
    username: user.username,
    enableDynamicBonus: user.enableDynamicBonus,
  };
};

module.exports = { register, login, registerWithHouseAdmin, registerAgent };
