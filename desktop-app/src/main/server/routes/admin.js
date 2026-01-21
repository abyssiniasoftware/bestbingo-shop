const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { isIdValid } = require('../utils/validator');
const validate = require('../middleware/validate');

router.get(
  '/games',
  auth(['super_admin']),
  adminController.getGamesByDateAndUser
);
router.get('/games/all', auth(['super_admin']), adminController.getAllGames);
router.get(
  '/games/:userId',
  auth(['super_admin', 'house_admin']),
  isIdValid('userId'),
  validate,
  adminController.getGamesByUserId
);
router.get(
  '/games/house/:houseId',
  auth(['super_admin', 'house_admin', 'cashier']),
  isIdValid('houseId'),
  validate,
  adminController.getGamesByHouseId
);
router.get(
  '/stats/:houseId',
  auth(['super_admin', 'house_admin']),
  isIdValid('houseId'),
  validate,
  adminController.getMonthlyStats
);
router.get(
  '/games/agent/:agentId',
  auth(['super_admin', 'agent']),
  isIdValid('agentId'),
  validate,
  adminController.getGamesByAgentId
);

module.exports = router;