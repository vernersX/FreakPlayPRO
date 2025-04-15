// routes/bets.js
const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');

router.post('/', betController.placeBet);
router.get('/my', betController.getMyBets);
router.get('/history', betController.getBetHistory);
router.get('/forMatch', betController.getBetForMatch);

module.exports = router;