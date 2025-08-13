const authService = require("../services/authService");
const houseService = require("../services/houseService");
const mongoose = require("mongoose");

const register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, password, branch, phone } = req.body;
    const registeredBy = req.user.id;
    // Register both cashier and house admin
    const { cashier, houseAdmin } = await authService.registerWithHouseAdmin(
      {
        username,
        password,
        branch,
        phone,
        registeredBy,
      },
      session
    );

    // Create house with cashier ID, house admin ID, and branch as name
    const house = await houseService.createHouse(
      {
        name: branch,
        cashierId: cashier._id,
        houseAdminId: houseAdmin._id,
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Users and house registered successfully",
      users: [
        { id: cashier._id, role: cashier.role, username: cashier.username },
        {
          id: houseAdmin._id,
          role: houseAdmin.role,
          username: houseAdmin.username,
        },
      ],
      house: { id: house._id, name: house.name },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `${field} already exists` });
    }

    // Handle specific house creation errors
    if (error.message.includes("House")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      message: "User registered",
      user: { id: user._id, role: user.role },
    });
  } catch (error) {
    // If validation error (from Mongoose or custom logic)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    // If duplicate key (e.g., duplicate username/email)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `${field} already exists` });
    }

    // Custom thrown error (optional)
    if (error.statusCode && error.message) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Generic server error fallback
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerAgent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (req.user.role !== "super_admin") {
      throw new Error("Only super admins can register agents");
    }

    const { username, password, fullname, address, phone } = req.body;

    const registeredBy = req.user.id;

    const agent = await authService.registerAgent(
      {
        username,
        password,
        fullname,
        address,
        phone,
        registeredBy,
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Agent registered successfully",
      user: {
        id: agent._id,
        role: agent.role,
        username: agent.username,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `${field} already exists` });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res, next) => {
  try {
    const { token, role, id, houseId, package } = await authService.login(
      req.body
    );
    res.json({ token, role, id, houseId, package });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, registerAdmin, registerAgent };
