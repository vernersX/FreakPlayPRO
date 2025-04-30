// routes/dailyReward.js
const express = require('express');
const {
  claimDailyReward,
  getDailyRewardStatus
} = require('../controllers/dailyRewardController');

const router = express.Router();

// now POST /api/daily-reward/claim
router.post('/claim', claimDailyReward);

// now GET  /api/daily-reward/status/:telegramId
router.get('/status/:telegramId', getDailyRewardStatus);

module.exports = router;
