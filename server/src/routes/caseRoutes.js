const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const auth = require('../middleware/auth');

router.get('/house-cases', auth(['house_admin']), caseController.getHouseCaseStats);

module.exports = router;