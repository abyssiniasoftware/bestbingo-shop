const express = require('express');
const router = express.Router();

router.use('/', async (req, res) => {
  const kidusamount = 250.75;
  const tekesteamount = 20000;

  res.json({
    status: "success",
    kidusamount,
    tekesteamount,
  });
});

module.exports = router;