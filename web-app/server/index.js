const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/error");
const logger = require("./src/utils/logger");
const auth = require("./src/middleware/auth");
const caseRoutes = require("./src/routes/caseRoutes");
const User = require('./src/models/User');
const authService = require('./src/services/authService');
const houseService = require('./src/services/houseService');
const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
  })
);

// Body parser
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/house", require("./src/routes/house"));
app.use("/api/bingo-card", require("./src/routes/bingoCard"));
app.use("/api/game", require("./src/routes/bingoGame"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/stats", require("./src/routes/stats"));
app.use("/api/cases", caseRoutes);
app.use("/api/cut-amount", require("./src/routes/cutAmount"));

app.use("/api/payment", async (req, res) => {
  const kidusamount = 250.75;
  const tekesteamount = 20000;

  res.json({
    status: "success",
    kidusamount,
    tekesteamount,
  });
});
// Protected route for authenticated user info
app.get("/api/me", auth(), async (req, res) => {
 try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove sensitive data before sending
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    logger.error('Error in /api/me:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ name: "ቤስት ቢንጎ ጨዋታዎች" });
});

// Error handler
app.use(errorHandler);
async function registerStaticUsersAndHouse() {
  try {
    const staticData = {
      username: 'test',
      password: 'admin123',
      branch: 'Main Branch',
      phone: '0911223344',
    };

    const branchFirstPart = staticData.branch.split(' ')[0];
    const cashierUsername = `${staticData.username}.${branchFirstPart}`;

    let cashier = await User.findOne({ username: cashierUsername });
    let houseAdmin = await User.findOne({ username: staticData.username });

    if (!cashier || !houseAdmin) {
      const registered = await authService.registerWithHouseAdmin(staticData);
      cashier = cashier || registered.cashier;
      houseAdmin = houseAdmin || registered.houseAdmin;
      logger.info('Static users registered');
    } else {
      logger.info('Static users already exist');
    }

    const existingHouse = await houseService.findHouse({ name: staticData.branch });
    if (!existingHouse) {
      const house = await houseService.createHouse({
        name: staticData.branch,
        cashierId: cashier._id,
        houseAdminId: houseAdmin._id
      });
      logger.info('House created:', house.name);
    } else {
      // Ensure house is linked to these users if it already exists but IDs might differ (less likely but for safety)
      logger.info('House already exists:', existingHouse.name);
    }

    logger.info('Static users and house setup completed');
  } catch (error) {
    logger.error('Registration error:', error.message);
  }
}

const PORT = process.env.PORT || 4004;
app.listen(PORT, async () => {
  await connectDB();
  try {
    const existingUser = await User.findOne({ username: 'super' });
    if (!existingUser) {
      await User.create({
        username: 'super',
        password: 'super123',
        role: 'super_admin',
        fullname: 'Admin User',
        address: 'Addis Ababa',
        phone: '0912345678',
        branch: 'Main Office',
        createdAt: new Date()
      });
      logger.info('Default super_admin user created.');
    } else {
      logger.info('Default super_admin user already exists.');
    }

    await registerStaticUsersAndHouse();
    logger.info(`Server running on port ${PORT}`);
  } catch (error) {
    logger.error('Startup error:', error);
    process.exit(1);
  }
  logger.info(`Server running on port ${PORT}`);
});
