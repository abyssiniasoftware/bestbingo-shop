const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');

const errorHandler = require('./middleware/error');
const logger = require('./utils/logger');
const auth = require('./middleware/auth');
const caseRoutes = require('./routes/caseRoutes');
const User = require('./models/User');
const authService = require('./services/authService');
const houseService = require('./services/houseService');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/house', require('./routes/house'));
app.use('/api/bingo-card', require('./routes/bingoCard'));
app.use('/api/game', require('./routes/bingoGame'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/cases', caseRoutes);
app.use('/api/cut-amount', require('./routes/cutAmount'));

app.use('/api/payment', async (req, res) => {
  const kidusamount = 250.75;
  const tekesteamount = 20000;
  res.json({ status: 'success', kidusamount, tekesteamount });
});

app.get('/api/me', auth(), async (req, res) => {
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
app.use(express.static(path.join(__dirname, '../renderer')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../renderer/index.html'));
});
app.get('/', (req, res) => {
  res.json({ name: 'BestBingo games' });
});

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
  try {
    const existingUser = await User.findOne({ username: 'super' });
    if (!existingUser) {
      await User.save({
        username: 'super',
        password: 'ADE13@BESTBNG',
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
});