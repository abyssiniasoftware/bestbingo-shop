const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["super_admin", "agent", "house_admin", "cashier"],
    required: true,
  },
  fullname: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  houseId: { type: mongoose.Schema.Types.ObjectId, ref: "House" },
  package: { type: Number, default: 0 }, // For house_admin and cashier
  createdAt: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false },
  bannedBy: { type: String, default: "" },
  branch: { type: String, trim: true },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  enableDynamicBonus: {
    type: Boolean,
    default: false, // Only super admins can toggle this for cashiers
  },
});

module.exports = mongoose.model("User", userSchema);
