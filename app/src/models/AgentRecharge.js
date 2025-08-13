const mongoose = require("mongoose");

const agentRechargeSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  packageAdded: { type: Number, required: true },
  superAdminCommission: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("AgentRecharge", agentRechargeSchema);
