const User = require('../models/User');
const House = require('../models/House');
const BingoCard = require('../models/BingoCard');
const defaultCards = require('../models/defaultCards');
const authService = require('../services/authService');
const houseService = require('../services/houseService');
const logger = require("./logger");

const registerStaticUsersAndHouse = async () => {
  try {
    const staticData = {
      username: "test",
      password: "admin123",
      branch: "Main Branch",
      phone: "0911223344",
    };
    const branchFirstPart = staticData.branch.split(" ")[0];
    const cashierUsername = `${staticData.username}.${branchFirstPart}`;

    let cashier = await User.findOne({ username: cashierUsername });
    let houseAdmin = await User.findOne({ username: staticData.username });

    // Register cashier if missing
    if (!cashier) {
      cashier = await authService.register({
        username: cashierUsername,
        password: staticData.password,
        role: "cashier",
        fullname: `${staticData.username} cashier`,
        address: staticData.branch,
        branch: staticData.branch,
        phone: staticData.phone,
      });
      logger.info("Static cashier registered");
    }

    // Register house admin if missing
    if (!houseAdmin) {
      houseAdmin = await authService.register({
        username: staticData.username,
        password: staticData.password,
        role: "house_admin",
        fullname: staticData.username,
        address: staticData.branch,
        branch: staticData.branch,
        phone: staticData.phone,
      });
      logger.info("Static house admin registered");
    }

    // Ensure house is created and linked
    const existingHouse = await House.findOne({ name: staticData.branch });
    if (!existingHouse) {
      await houseService.createHouse({
        name: staticData.branch,
        cashierId: cashier._id,
        houseAdminId: houseAdmin._id,
      });
      logger.info("Static house created");
    }

    if (!cashier || cashier.role !== "cashier") {
      logger.warn("Skipping card insertion (cashier missing or invalid)");
    } else {
      const cardCount = await BingoCard.countDocuments({ userId: cashier._id });

      if (cardCount === 0) {
        await BingoCard.insertMany(
          defaultCards.map(card => ({
            ...card,
            userId: cashier._id,
          }))
        );
        logger.info(`Default cards inserted for cashier ${cashier.username}`);
      }
    }
    logger.info("Static users and house setup completed");
  } catch (error) {
    logger.error("Registration error:", error);
  }
};

const initSuperAdmin = async () => {
    try {
        const existingUser = await User.findOne({ username: 'super' });
        if (!existingUser) {
          const superAdminData = {
            username: 'super',
            password: 'super123',
            role: 'super_admin',
            fullname: 'Admin User',
            address: 'Addis Ababa',
            phone: '0912345678',
            branch: 'Main Office',
            createdAt: new Date()
          }
    
          await authService.register(superAdminData);
          logger.info('Default super_admin user created.');
        } else {
          logger.info('Default super_admin user already exists.');
        }
    } catch (error) {
        logger.error('Error creating super admin:', error);
    }
};

module.exports = { registerStaticUsersAndHouse, initSuperAdmin };