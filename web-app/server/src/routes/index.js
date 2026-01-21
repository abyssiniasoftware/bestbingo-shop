const express = require('express');
const router = express.Router();

// Import Route Files
const authRoutes = require("./auth");
const userRoutes = require("./user");
const statsRoutes = require("./stats");
const houseRoutes = require("./house");
const bingoCardRoutes = require("./bingoCard");
const caseRoutes = require("./caseRoutes");
const cutAmountRoutes = require("./cutAmount");
const bingoGameRoutes = require("./bingoGame");
const adminRoutes = require("./admin");
const paymentRoutes = require("./payment");
const profileRoutes = require("./profile"); // The /api/me route

// Mount Routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/house", houseRoutes);
router.use("/bingo-card", bingoCardRoutes);
router.use("/game", bingoGameRoutes);
router.use("/admin", adminRoutes);
router.use("/stats", statsRoutes);
router.use("/cases", caseRoutes);
router.use("/cut-amount", cutAmountRoutes);
router.use("/payment", paymentRoutes);
router.use("/", profileRoutes); // Mounted at root so it becomes /api/me

module.exports = router;