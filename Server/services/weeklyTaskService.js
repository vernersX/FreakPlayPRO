// Server/services/weeklyTaskService.js
const { models } = require('../db/init');
const { WeeklyTaskDefinition, UserWeeklyTask, User, Item, InventoryItem, Card } = models;
const definitions = require('../constants/weeklyTaskDefinitions');
const { RARITY_DEFINITIONS } = require('../constants/rarities');
const { startOfWeek, differenceInCalendarWeeks } = require('date-fns');

// Reference Monday for rotating window calculations
const REFERENCE_MONDAY = new Date(2025, 0, 6); // Jan 6, 2025

/**
 * Ensure DB definitions mirror our constants
 */
async function seedDefinitions() {
  for (const def of definitions) {
    await WeeklyTaskDefinition.upsert(def);
  }
  console.log(`✅ Seeded ${definitions.length} weekly-task definitions.`);
}

/**
 * Pick 5 definitions for current week via sliding window
 */
async function pickThisWeekDefinitions() {
  const allDefs = await WeeklyTaskDefinition.findAll({ order: [['displayOrder', 'ASC']] });
  const N = allDefs.length;
  const per = 5;

  const today = new Date();
  const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
  const weekIndex = differenceInCalendarWeeks(thisMonday, REFERENCE_MONDAY, { weekStartsOn: 1 });

  const start = (weekIndex * per) % N;
  const windowDefs = [];
  for (let i = 0; i < per; i++) {
    windowDefs.push(allDefs[(start + i) % N]);
  }
  return windowDefs;
}

/**
 * Calculate the start of the current ISO week (Monday at 00:00)
 */
function getCurrentWeekStart() {
  const now = new Date();
  // getDay(): 0 (Sunday) to 6 (Saturday)
  const day = now.getDay();
  // number of days since Monday: 0 for Monday, 6 for Sunday
  const diff = (day + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Assign this week's tasks to a single user if they don't exist
 */
async function assignTasksForUser(userId) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const defs = await pickThisWeekDefinitions();

  for (const def of defs) {
    await UserWeeklyTask.findOrCreate({
      where: { userId, definitionId: def.id, weekStart },
      defaults: { progress: 0, rewarded: false }
    });
  }
}

/**
 * Assign this week's tasks to all users (for cron)
 */
async function assignWeeklyTasksToAllUsers() {
  const users = await User.findAll({ attributes: ['id'] });
  for (const { id: userId } of users) {
    await assignTasksForUser(userId);
  }
}

/**
 * Increment progress on tasks matching actionKey
 */
async function recordAction(userId, actionKey) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const tasks = await UserWeeklyTask.findAll({
    where: { userId, completed: false, weekStart },
    include: [{ model: WeeklyTaskDefinition, as: 'definition' }]
  });

  for (const task of tasks) {
    const { criteria = {} } = task.definition;
    if (criteria.action !== actionKey) continue;

    task.progress += 1;
    if (task.progress >= (criteria.count || 0)) {
      task.completed = true;
    }
    await task.save();
  }
}

/**
 * Get or seed and return this week's tasks for a user
 */
async function getUserTasks(userId) {
  await seedDefinitions();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  let assignments = await UserWeeklyTask.findAll({
    where: { userId, weekStart },
    include: [{ model: WeeklyTaskDefinition, as: 'definition' }],
    order: [['createdAt', 'ASC']]
  });

  if (assignments.length === 0) {
    await assignTasksForUser(userId);
    assignments = await UserWeeklyTask.findAll({
      where: { userId, weekStart },
      include: [{ model: WeeklyTaskDefinition, as: 'definition' }],
      order: [['createdAt', 'ASC']]
    });
  }

  return assignments;
}

async function claimReward(userId, telegramId, taskId) {
  const weekStart = getCurrentWeekStart();
  const userTask = await UserWeeklyTask.findOne({
    where: { id: taskId, userId, weekStart },
    include: [{ model: WeeklyTaskDefinition, as: 'definition' }]
  });
  if (!userTask) {
    const err = new Error('Task not found'); err.status = 404; throw err;
  }
  if (!userTask.completed) {
    const err = new Error('Task not completed'); err.status = 400; throw err;
  }
  if (userTask.rewarded) {
    const err = new Error('Reward already claimed'); err.status = 400; throw err;
  }

  const { rewardType, rewardValue } = userTask.definition;
  userTask.rewarded = true;
  await userTask.save();

  // Grant item if applicable
  if (rewardType === 'item') {
    const itemDef = await Item.findOne({ where: { type: rewardValue.itemKey } });
    if (itemDef) {
      const [inv] = await InventoryItem.findOrCreate({
        where: { UserTelegramId: telegramId, ItemId: itemDef.id },
        defaults: { quantity: 0 }
      });
      inv.quantity += 1;
      await inv.save();
    }
  }
  else if (rewardType === 'card' && rewardValue.rarity) {
    const rarityKey = rewardValue.rarity;
    const def = RARITY_DEFINITIONS[rarityKey];

    if (!def) {
      console.warn(`Unknown rarity '${rarityKey}' in RARITY_DEFINITIONS`);
    } else {
      await Card.create({
        userId: userId,           // or UserTelegramId: telegramId
        rarity: rarityKey,
        baseValue: def.baseValue,    // from your constants
        imageURL: rewardValue.imageURL || def.imageURL,
        baseCooldownMultiplier: def.baseCooldownMultiplier,
        cooldownMultiplier: 1.0,
        winStreak: 0,
        isLocked: false,
        cooldownUntil: null
      });
    }
  }

  return { rewardType, rewardValue };
}

async function trackTaskProgress(userId, actionType, increment = 1) {
  const weekStart = getCurrentWeekStart();

  // find all incomplete tasks for this user with matching criteria
  const tasks = await UserWeeklyTask.findAll({
    where: {
      userId,
      completed: false,
      weekStart,
    },
    include: [{
      model: WeeklyTaskDefinition,
      as: 'definition',
      where: { 'criteria.action': actionType }
    }]
  });

  // update each task
  await Promise.all(tasks.map(async (task) => {
    const config = task.definition.criteria;  // e.g. { count: 1, action: 'mergeCards' }
    task.progress += increment;
    if (task.progress >= config.count) {
      task.completed = true;
    }
    await task.save();
  }));
}

/**
 * Reset progress for a given actionType (used on failures or breaks in a streak).
 */
async function resetTaskProgress(userId, actionType) {
  const weekStart = getCurrentWeekStart();
  // Find all incomplete tasks of that type this week and zero them out
  const tasks = await UserWeeklyTask.findAll({
    where: { userId, completed: false, weekStart },
    include: [{
      model: WeeklyTaskDefinition,
      as: 'definition',
      where: { 'criteria.action': actionType }
    }]
  });

  await Promise.all(tasks.map(task => {
    task.progress = 0;
    return task.save();
  }));
}

module.exports = {
  seedDefinitions,
  resetTaskProgress,
  pickThisWeekDefinitions,
  assignTasksForUser,
  assignWeeklyTasksToAllUsers,
  recordAction,
  getUserTasks,
  claimReward,
  trackTaskProgress
};
