require("dotenv").config();
// const http = require('http'); // Optional, but good practice
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");
const app = require("./src/app");
const { registerStaticUsersAndHouse, initSuperAdmin } = require("./src/utils/bootstrap");

const PORT = process.env.PORT || 4004;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    logger.info("Database connected successfully");

    // 2. Run Bootstrap Logic (Seeding)
    await initSuperAdmin();
    await registerStaticUsersAndHouse();

    // 3. Start Server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

  } catch (error) {
    logger.error('Startup error:', error);
    process.exit(1);
  }
};

startServer();