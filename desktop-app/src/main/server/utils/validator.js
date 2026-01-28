const { check, param } = require('express-validator');
const User = require('../models/User');
const House = require('../models/House');

const adminValidation = [
  check('username').notEmpty().withMessage('Username is required').trim(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  check('fullname').notEmpty().withMessage('Full name is required').trim(),
  check('address').notEmpty().withMessage('Address is required').trim(),
  check('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  check('role')
    .isIn(['super_admin', 'house_admin', 'cashier', 'agent'])
    .withMessage('Invalid role')
];

const userValidation = [
  check('username').notEmpty().withMessage('Username is required').trim(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  check('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  check('branch').notEmpty().withMessage('Branch is required').trim()
];

const loginValidation = [
  check('username').notEmpty().withMessage('Username is required').trim(),
  check('password').notEmpty().withMessage('Password is required')
];

const houseValidation = [
  check('name').notEmpty().withMessage('House name is required').trim(),
  check('houseAdminId')
    .notEmpty()
    .withMessage('House admin ID is required')
    .custom(async (id) => {
      const user = await User.findOne({ _id: id });
      if (!user || user.role !== 'house_admin') {
        throw new Error('House admin not found or invalid role');
      }
      return true;
    })
];

// const assignCashierValidation = [
//   check('houseId')
//     .notEmpty()
//     .withMessage('House ID is required')
//     .custom(async (id) => {
//       const house = await House.findOne({ _id: id });
//       if (!house) {
//         throw new Error('House not found');
//       }
//       return true;
//     }),
//   check('cashierId')
//     .notEmpty()
//     .withMessage('Cashier ID is required')
//     .custom(async (id) => {
//       const user = await User.findOne({ _id: id });
//       if (!user || user.role !== 'cashier') {
//         throw new Error('Cashier not found or invalid role');
//       }
//       return true;
//     })
// ];

const rechargeValidation = [
  check('houseId').notEmpty().withMessage('House ID is required'),
  check('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
];

const rechargeUpdateValidation = [
  check('rechargeId').optional().notEmpty().withMessage('Recharge ID is required'),
  check('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  check('superAdminCommission')
    .isFloat({ min: 0.01, max: 1 })
    .withMessage('Commission must be between 1% and 100% (as decimal)')
];

const bingoCardValidation = [
  check('cardId').notEmpty().withMessage('Card ID is required').trim(),
  check('userId').notEmpty().withMessage('User ID is required from validator'),
  check('b1')
    .isInt({ min: 1, max: 15 })
    .withMessage('B1 must be between 1 and 15'),
  check('b2')
    .isInt({ min: 1, max: 15 })
    .withMessage('B2 must be between 1 and 15'),
  check('b3')
    .isInt({ min: 1, max: 15 })
    .withMessage('B3 must be between 1 and 15'),
  check('b4')
    .isInt({ min: 1, max: 15 })
    .withMessage('B4 must be between 1 and 15'),
  check('b5')
    .isInt({ min: 1, max: 15 })
    .withMessage('B5 must be between 1 and 15'),
  check('i1')
    .isInt({ min: 16, max: 30 })
    .withMessage('I1 must be between 16 and 30'),
  check('i2')
    .isInt({ min: 16, max: 30 })
    .withMessage('I2 must be between 16 and 30'),
  check('i3')
    .isInt({ min: 16, max: 30 })
    .withMessage('I3 must be between 16 and 30'),
  check('i4')
    .isInt({ min: 16, max: 30 })
    .withMessage('I4 must be between 16 and 30'),
  check('i5')
    .isInt({ min: 16, max: 30 })
    .withMessage('I5 must be between 16 and 30'),
  check('n1')
    .isInt({ min: 31, max: 45 })
    .withMessage('N1 must be between 31 and 45'),
  check('n2')
    .isInt({ min: 31, max: 45 })
    .withMessage('N2 must be between 31 and 45'),
  check('n4')
    .isInt({ min: 31, max: 45 })
    .withMessage('N4 must be between 31 and 45'),
  check('n5')
    .isInt({ min: 31, max: 45 })
    .withMessage('N5 must be between 31 and 45'),
  check('g1')
    .isInt({ min: 46, max: 60 })
    .withMessage('G1 must be between 46 and 60'),
  check('g2')
    .isInt({ min: 46, max: 60 })
    .withMessage('G2 must be between 46 and 60'),
  check('g3')
    .isInt({ min: 46, max: 60 })
    .withMessage('G3 must be between 46 and 60'),
  check('g4')
    .isInt({ min: 46, max: 60 })
    .withMessage('G4 must be between 46 and 60'),
  check('g5')
    .isInt({ min: 46, max: 60 })
    .withMessage('G5 must be between 46 and 60'),
  check('o1')
    .isInt({ min: 61, max: 75 })
    .withMessage('O1 must be between 61 and 75'),
  check('o2')
    .isInt({ min: 61, max: 75 })
    .withMessage('O2 must be between 61 and 75'),
  check('o3')
    .isInt({ min: 61, max: 75 })
    .withMessage('O3 must be between 61 and 75'),
  check('o4')
    .isInt({ min: 61, max: 75 })
    .withMessage('O4 must be between 61 and 75'),
  check('o5')
    .isInt({ min: 61, max: 75 })
    .withMessage('O5 must be between 61 and 75')
];

const bingoGameValidation = [
  check('houseId').notEmpty().withMessage('House ID is required'),
  check('userId').notEmpty().withMessage('User ID is required'),
  check('stakeAmount')
    .isFloat({ min: 5 })
    .withMessage('Stake amount must be at least 5'),
  check('numberOfPlayers')
    .isInt({ min: 1 })
    .withMessage('Number of players must be at least 1'),
  check('cutAmountPercent')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Cut amount percent must be between 0 and 100')
];

const bingoGameWinnerValidation = [
  check('houseId').notEmpty().withMessage('House ID is required'),
  check('gameId').isNumeric().withMessage('Invalid game ID'),
  check('winnerCardId')
    .isNumeric()
    .withMessage('Winner card ID must be a number')
];

const idValidation = [param('id').notEmpty().withMessage('ID is required')];

const isIdValid = (...keys) => {
  return keys.map((key) =>
    param(key).notEmpty().withMessage(`${key} must be a valid ID`)
  );
};

module.exports = {
  // assignCashierValidation,
  isIdValid,
  userValidation,
  loginValidation,
  houseValidation,
  rechargeValidation,
  bingoCardValidation,
  bingoGameValidation,
  idValidation,
  bingoGameWinnerValidation,
  adminValidation,
  rechargeUpdateValidation
};