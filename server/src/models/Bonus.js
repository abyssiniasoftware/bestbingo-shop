const mongoose = require("mongoose");

const bonusSchema = new mongoose.Schema({
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gameId: {
    type: Number,
    required: true,
    unique: true,
  },
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true,
  },

  bonusAmount: {
    type: Number,
    required: true,
    default: 500,
  },
  bonusType: {
    type: String,
    enum: ["manual", "dynamic"],
    default: "manual",
  },
  collectBonusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CollectBonus",
    required: false,
  },
  dateIssued: {
    type: Date,
    default: Date.now,
  },
});

const Bonus = mongoose.model("Bonus", bonusSchema);
module.exports = Bonus;
