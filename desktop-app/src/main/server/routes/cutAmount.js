const express = require('express');
const router = express.Router();
const CutAmountSetting = require('../models/CutAmountSetting');
const auth = require('../middleware/auth');
const { isIdValid } = require('../utils/validator');
const validate = require('../middleware/validate');

// GET cut amount setting for a cashier
router.get(
  '/:cashierId',
  auth(['cashier']),
  isIdValid('cashierId'),
  validate,
  async (req, res) => {
    try {
      const setting = await CutAmountSetting.findOne({ cashierId: req.params.cashierId });
      if (!setting) {
        return res.status(404).json({ message: 'Cut amount setting not found' });
      }
      res.json(setting);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PATCH create or update cut amount setting
router.patch(
  '/:cashierId',
  auth(['cashier']),
  isIdValid('cashierId'),
  validate,
  async (req, res) => {
    try {
      const { cutAmount } = req.body;

      if (cutAmount === undefined || typeof cutAmount !== 'number' || cutAmount < 0 || cutAmount > 100) {
        return res.status(400).json({ message: 'Invalid cut amount' });
      }

      let setting = await CutAmountSetting.findOne({ cashierId: req.params.cashierId });

      if (!setting) {
        // If not exists, create new
        setting = await CutAmountSetting.insert({
          cashierId: req.params.cashierId,
          cutAmount
        });
      } else {
        // If exists, update
        await CutAmountSetting.updateOne(
          { cashierId: req.params.cashierId },
          { cutAmount }
        );
        setting = await CutAmountSetting.findOne({ cashierId: req.params.cashierId });
      }

      res.json(setting);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
