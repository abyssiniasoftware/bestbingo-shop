const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const auth = require("../middleware/auth");

router.get("/daily", auth(["cashier"]), statsController.getDailyStats);
router.get("/house", auth(["house_admin","cashier"]), statsController.getHouseStats);
router.get("/super", auth(["super_admin"]), statsController.getSuperAdminStats);
router.get("/agent", auth(["agent"]), statsController.getAgentStats);

module.exports = router;
