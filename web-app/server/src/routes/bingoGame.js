const express = require("express");
const router = express.Router();
const bingoGameController = require("../controllers/bingoGameController");
const auth = require("../middleware/auth");
const {
  bingoGameValidation,
  bingoGameWinnerValidation,
  idValidation,
  isIdValid,
} = require("../utils/validator");
const validate = require("../middleware/validate");

router.post(
  "/create",
  auth(["cashier"]),
  bingoGameValidation,
  validate,
  bingoGameController.createGame
);
router.post("/award", auth(["cashier"]), bingoGameController.awardBonus);
router.put(
  "/update-winner",
  auth(["cashier"]),
  bingoGameWinnerValidation,
  validate,
  bingoGameController.updateGameWinner
);
router.get(
  "/active-dynamic",
  auth(["super_admin", "cashier", "house_admin"]),
  bingoGameController.getActiveDynamicBonus
);
router.post(
  "/mark-inactive",
  auth(["super_admin", "cashier", "house_admin"]),
  bingoGameController.markBonusInactive
);
router.get(
  "/bonuses",
  auth(["super_admin"]),
  bingoGameController.getAllBonuses
);
router.get(
  "/agent-bonuses",
  auth(["agent"]),
  bingoGameController.getAllBonusesUnderAgent
);
router.get(
  "/last-winner",
  auth(["cashier", "house_admin"]),
  bingoGameController.getLastWinner
);
router.get(
  "/all/:userId",
  auth(["cashier", "house_admin"]),
  isIdValid("userId"),
  validate,
  bingoGameController.getGamesByUser
);
router.get(
  "/last/:userId",
  auth(["cashier", "house_admin"]),
  isIdValid("userId"),
  validate,
  bingoGameController.getLastGame
);
router.get(
  "/:userId/:gameId",
  auth(["cashier", "house_admin"]),
  isIdValid("userId", "gameId"),
  validate,
  bingoGameController.getGameById
);
router.get(
  "/house/:houseId/bonuses",
  auth(["house_admin","cashier"]),
  isIdValid("houseId"),
  validate,
  bingoGameController.getBonusesByHouse
);
router.delete(
  "/:userId/:gameId",
  auth(["house_admin"]),
  isIdValid("userId", "gameId"),
  validate,
  bingoGameController.deleteGame
);
router.delete(
  "/remove",
  auth(["super_admin"]),
  bingoGameController.deleteAllGames
);

module.exports = router;
