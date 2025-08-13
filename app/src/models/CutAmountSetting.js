const mongoose = require("mongoose");

const cutAmountSettingSchema = new mongoose.Schema({
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  cutAmount: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CutAmountSetting", cutAmountSettingSchema);
