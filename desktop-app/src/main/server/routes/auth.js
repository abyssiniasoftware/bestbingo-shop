const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { userValidation, adminValidation, loginValidation } = require('../utils/validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post(
  '/register',
  auth(['super_admin', 'agent']),
  userValidation,
  validate,
  authController.register
);
router.post(
  '/register/admin',
  adminValidation,
  validate,
  authController.registerAdmin
);
router.post(
  '/register/agent',
  auth(['super_admin']),
  adminValidation,
  validate,
  authController.registerAgent
);
router.post('/login', loginValidation, validate, authController.login);

module.exports = router;