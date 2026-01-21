const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const User = require('../models/User');
const logger = require("../utils/logger");

// Protected route for authenticated user info
router.get("/me", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove sensitive data before sending
    const userData = user.toObject();
    delete userData.password;
    res.json(userData);
  } catch (error) {
    logger.error('Error in /api/me:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;