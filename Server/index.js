require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDB, syncModels } = require('./db/init');
// routes
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const betRoutes = require('./routes/bets');
const cardsRoutes = require('./routes/cards');
const auctionsRoutes = require('./routes/auctions');
const inventoryRoutes = require('./routes/inventory');
const marketplaceRoutes = require('./routes/marketplace');
const sportRoutes = require('./routes/sport');
const leagueRoutes = require('./routes/leagues');

const adminRouter = require('./routes/admin');
// services
const oddsService = require('./services/oddsService');
const telegramService = require('./services/telegramService');
const sportService = require('./services/sportService');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

app.set('models', require('./db/init').models);

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/auctions', auctionsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/leagues', leagueRoutes);


app.use('/api/admin', adminRouter);

// Manual odds sync endpoint
app.get('/api/odds/sync', async (req, res) => {
  try {
    await oddsService.fetchAllOdds();
    res.json({ message: 'Manual sync for all sports complete!' });
  } catch (error) {
    console.error('Error syncing odds:', error);
    res.status(500).json({ error: 'Failed to sync odds' });
  }
});

// Start server after database is ready
connectToDB().then(() => {
  syncModels().then(() => {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Immediately fetch odds on startup
      oddsService.fetchAllOdds();

      // Immediately fetch all sports on startup
      sportService.updateAllSports();

      // Schedule periodic tasks every 15 minutes
      cron.schedule('*/15 * * * *', async () => {
        await oddsService.fetchAllOdds();
        await oddsService.resolveMatches();
      });

      // Launch the Telegram bot
      telegramService.launchBot();
    });
  });
});

