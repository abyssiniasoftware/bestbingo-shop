const express = require('express');
const router = express.Router();
const bingoCardController = require('../controllers/bingoCardController');
const auth = require('../middleware/auth');
const { bingoCardValidation,isIdValid } = require('../utils/validator');
const validate = require('../middleware/validate');

router.post('/create', auth(['house_admin', 'cashier']), bingoCardValidation, validate, bingoCardController.generateCard);
router.get('/:userId', auth(['house_admin', 'cashier']), isIdValid('userId'), validate, bingoCardController.getCardsByUser);
router.get('/:userId/card-ids', auth(['house_admin', 'cashier']), isIdValid('userId'), validate, bingoCardController.getCardIds);
router.get('/:userId/:cardId', auth(['house_admin', 'cashier']), isIdValid('userId'), validate, bingoCardController.getCardById);
router.put('/:userId/:cardId', auth(['house_admin', 'cashier']), isIdValid('userId'), bingoCardValidation, validate, bingoCardController.updateCard);
router.delete('/:userId/:cardId', auth(['house_admin', 'cashier']), isIdValid('userId'), validate, bingoCardController.deleteCard);
router.delete('/remove/all/:userId', auth(['house_admin', 'cashier']), isIdValid('userId'), validate, bingoCardController.deleteAllCards);
router.post('/bulk', auth(['house_admin', 'cashier']), bingoCardController.bulkCreateCards);

module.exports = router;