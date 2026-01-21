const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');
const auth = require('../middleware/auth');
const { houseValidation, rechargeValidation, rechargeUpdateValidation } = require('../utils/validator');
const validate = require('../middleware/validate');

router.post(
  '/create',
  auth(['super_admin']),
  houseValidation,
  validate,
  houseController.createHouse
);
router.post(
  '/recharge-agent',
  auth(['super_admin']),
  houseController.rechargeAgent
);
router.post(
  '/assign-cashier',
  auth(['super_admin', 'house_admin']),
  validate,
  houseController.assignCashier
);
router.post(
  '/recharge',
  auth(['super_admin', 'agent']),
  rechargeValidation,
  validate,
  houseController.rechargeHouse
);
router.post(
  '/update-recharge',
  auth(['super_admin']),
  rechargeUpdateValidation,
  validate,
  houseController.updateRecharge
);
router.get('/', auth(['super_admin']), houseController.getHouse);
router.get('/my-house', auth(['agent']), houseController.getMyHouse);
router.get(
  '/recharge-history',
  auth(['super_admin', 'agent']),
  houseController.getRechargeHistory
);
router.get(
  '/agent-recharge-history',
  auth(['super_admin', 'agent']),
  houseController.getAgentRechargeHistory
);

module.exports = router;