// routes/weeklyTasks.js
const express = require('express');
const {
  getWeeklyTasks,
  claimWeeklyTask
} = require('../controllers/weeklyTaskController');

const router = express.Router();

// GET  /api/weekly-tasks/:telegramId
router.get('/status/:telegramId', getWeeklyTasks);

// POST /api/weekly-tasks/:telegramId/claim/:taskId
router.post('/:telegramId/claim/:taskId', claimWeeklyTask);

module.exports = router;
