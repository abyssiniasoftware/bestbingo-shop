const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  houseAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("House", houseSchema);
