// Server/controllers/weeklyTaskController.js
const { models } = require('../db/init');
const { getUserTasks, claimReward } = require('../services/weeklyTaskService');
const { User } = models;

/**
 * GET /api/weekly-tasks/status/:telegramId
 * Returns the list of current week's tasks for a given Telegram ID.
 */
exports.getWeeklyTasks = async (req, res) => {
  try {
    const { telegramId } = req.params;
    console.log('▶️ getWeeklyTasks called', new Date().toISOString(), 'params:', req.params);

    if (!telegramId) {
      return res.status(400).json({ message: 'Missing telegramId' });
    }

    // Find the user by Telegram ID
    const user = await User.findOne({ where: { telegramId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch (and auto-seed) the user's weekly tasks
    const assignments = await getUserTasks(user.id);

    // Flatten the definition into each task DTO
    const payload = assignments.map(task => ({
      id:           task.id,
      title:        task.definition.title,
      description:  task.definition.description,
      criteria:     task.definition.criteria,
      rewardType:   task.definition.rewardType,
      rewardValue:  task.definition.rewardValue,
      progress:     task.progress,
      completed:    task.completed,
      rewarded:     task.rewarded
    }));

    res.json(payload);
  } catch (error) {
    console.error('Error in getWeeklyTasks:', error);
    res.status(500).json({ message: 'Internal server errors!' });
  }
};

/**
 * POST /api/weekly-tasks/:telegramId/claim/:taskId
 * Claims a completed weekly task reward.
 */
exports.claimWeeklyTask = async (req, res) => {
    try {
      const { telegramId, taskId } = req.params;
      if (!telegramId || !taskId) {
        return res.status(400).json({ message: 'Missing telegramId or taskId' });
      }
  
      const user = await User.findOne({ where: { telegramId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Delegate all task-completion and inventory logic to the service
      const reward = await claimReward(user.id, telegramId, parseInt(taskId, 10));
  
      return res.json({ success: true, reward });
    } catch (error) {
      console.error('Error in claimWeeklyTask:', error);
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Internal server error' });
    }
  };
  