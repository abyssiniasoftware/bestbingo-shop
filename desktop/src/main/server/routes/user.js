const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { userValidation, idValidation, isIdValid } = require('../utils/validator');
const validate = require('../middleware/validate');

router.get('/', auth(['super_admin']), userController.getUsers);
router.post('/register-cards', userController.createBulk);
router.post('/bulk-upload', auth(['cashier']), userController.bulkUploadCards);
router.get('/user-cards/:userId', userController.userCards);
router.get('/user-card-bycardId/:userId/:cardId', userController.userCardById);
router.get('/agent', auth(['agent']), userController.getMyUsersByAgent);
router.get('/cashiers', auth(['super_admin']), userController.getCashiers);
router.get(
  '/:id',
  auth(['super_admin', 'house_admin']),
  idValidation,
  validate,
  userController.getUserById
);
router.put(
  '/:id',
  auth(['super_admin', 'house_admin', 'agent']),
  idValidation,
  userValidation,
  validate,
  userController.updateUser
);
router.put(
  '/update-password/:id',
  auth(['super_admin', 'house_admin', 'agent']),
  idValidation,
  userController.updateUserPassword
);
router.delete(
  '/:id',
  auth(['super_admin']),
  idValidation,
  validate,
  userController.deleteUser
);
router.put(
  '/ban/:id',
  auth(['super_admin', 'agent']),
  idValidation,
  validate,
  userController.banUser
);
router.get('/role/:role', auth(['super_admin']), userController.getUsersByRole);
router.get(
  '/house-admin/:houseAdminId',
  auth(['super_admin', 'house_admin']),
  isIdValid('houseAdminId'),
  validate,
  userController.getUsersByHouseAdmin
);
router.get(
  '/agent/:agentId',
  auth(['super_admin', 'agent']),
  isIdValid('agentId'),
  validate,
  userController.getUsersByAgent
);
router.patch(
  '/:id/dynamic-bonus',
  auth(['super_admin', 'cashier']),
  idValidation,
  validate,
  userController.updateDynamicBonus
);

module.exports = router;