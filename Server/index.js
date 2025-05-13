// Server/index.js

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

// DB & models
const { connectToDB, syncModels } = require('./db/init');

// Services
const oddsService = require('./services/oddsService');
const sportService = require('./services/sportService');
const telegramService = require('./services/telegramService');
const weeklyTaskService = require('./services/weeklyTaskService');

// Routers
const usersRouter = require('./routes/users');
const matchesRouter = require('./routes/matches');
const betsRouter = require('./routes/bets');
const inventoryRouter = require('./routes/inventory');
const cardsRouter = require('./routes/cards');
const auctionsRouter = require('./routes/auctions');
const marketplaceRouter = require('./routes/marketplace');
const sportsRouter = require('./routes/sport');
const leaguesRouter = require('./routes/leagues');
const adminRouter = require('./routes/admin');
const dailyRewardRoutes = require('./routes/dailyReward');
const weeklyTasksRouter = require('./routes/weeklyTasks');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'  // tighten this in production!
}));
app.use(express.json());


// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/users', usersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/bets', betsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/auctions', auctionsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/leagues', leaguesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/daily-reward', dailyRewardRoutes);
app.use('/api/weekly-tasks', weeklyTasksRouter);

// ─── Static React Build ──────────────────────────────────────────────────────
// Serve frontend/build as static assets
app.use(express.static(path.join(__dirname, '../frontend/build')));

// For any other request (that doesn't match /api/*), send back React's index.html
app.get('/*', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../frontend/build', 'index.html'),
    err => {
      if (err) {
        console.error('Error sending React app:', err);
        res.status(500).send(err);
      }
    }
  );
});

// ─── Startup ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // 1) Connect & sync DB
    await connectToDB();
    await syncModels();

    // 2) Initial data pulls & match resolution
    await oddsService.fetchAllOdds();
    await sportService.updateAllSports();
    await oddsService.resolveMatches();

    // 3) Launch Telegram bot
    telegramService.launchBot();

    // 4) Schedule recurring tasks (every 15 minutes)
    cron.schedule('*/15 * * * *', async () => {
      console.log('⏱️  Running scheduled refresh…');
      await oddsService.fetchAllOdds();
      await sportService.updateAllSports();
      await oddsService.resolveMatches();
    });

    // 5) seed your definitions for weekly tasks if needed (currently seeded in seed.js)
  // await weeklyTaskService.seedDefinitions();

  // 6) assign tasks right now on startup
  console.log('🔄 Assigning weekly tasks on startup');
  await weeklyTaskService.assignWeeklyTasksToAllUsers();

  // 7) schedule the Monday rotation at 00:05 Europe/Riga
  cron.schedule('5 0 * * 1', async () => {
    console.log('⏱️ Rotating weekly tasks for new week…');
    try {
      await weeklyTaskService.assignWeeklyTasksToAllUsers();
      console.log('✅ Weekly tasks rotated');
    } catch (err) {
      console.error('❌ Weekly tasks rotation failed:', err);
    }
  }, {
    timezone: 'Europe/Riga'
  });

    // 8) Start server
    app.listen(PORT, () =>
      console.log(`🚀 Server listening on port ${PORT}`)
    );

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
