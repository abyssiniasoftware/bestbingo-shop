const mongoose = require("mongoose");

const rechargeSchema = new mongoose.Schema({
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  packageAdded: { type: Number, required: true },
  superAdminCommission: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  rechargeBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Recharge", rechargeSchema);
