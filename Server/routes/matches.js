// routes/matches.js
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// Endpoint for upcoming matches
router.get('/upcoming', matchController.getUpcomingMatches);

// New endpoint to update matches
router.post('/update', matchController.updateMatches);

module.exports = router;
