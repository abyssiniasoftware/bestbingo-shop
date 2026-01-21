const express = require("express");
const router = express.Router();
const CutAmountSetting = require("../models/CutAmountSetting");
const auth = require("../middleware/auth");
const { isIdValid } = require("../utils/validator");
// Get cut amount setting
router.get(
  "/:cashierId",
  auth(["cashier"]),
  isIdValid("cashierId"),
  async (req, res) => {
    try {
      const setting = await CutAmountSetting.findOne({
        cashierId: req.params.cashierId,
      });
      if (!setting) {
        return res
          .status(404)
          .json({ message: "Cut amount setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update cut amount setting
router.patch(
  "/:cashierId",
  auth(["cashier"]),
  isIdValid("cashierId"),
  async (req, res) => {
    try {
      const { cutAmount } = req.body;
      if (cutAmount === undefined || cutAmount < 0 || cutAmount > 100) {
        return res.status(400).json({ message: "Invalid cut amount" });
      }

      let setting = await CutAmountSetting.findOne({
        cashierId: req.params.cashierId,
      });
      if (!setting) {
        setting = new CutAmountSetting({
          cashierId: req.params.cashierId,
          cutAmount,
        });
      } else {
        setting.cutAmount = cutAmount;
        setting.updatedAt = Date.now();
      }

      await setting.save();
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
