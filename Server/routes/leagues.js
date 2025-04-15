// routes/leagues.js
const express = require('express');
const router = express.Router();
const { listLeagues } = require('../controllers/leagueController');

router.get('/', listLeagues);

module.exports = router;
