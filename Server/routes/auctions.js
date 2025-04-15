// backend/routes/auctions.js
const express = require('express');
const router = express.Router();
const auctionService = require('../services/auctionService');
const { models } = require('../db/init');
const { User } = models;

// POST /api/auctions – Create an auction for a card
router.post('/', async (req, res) => {
    try {
        const { telegramId, cardId, startingPrice, endsAt } = req.body;
        // Get the user
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const auction = await auctionService.createAuction(cardId, user.id, startingPrice, endsAt);
        res.json(auction);
    } catch (err) {
        console.error('Error creating auction:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auctions/:auctionId/bid – Place a bid on an auction
router.post('/:auctionId/bid', async (req, res) => {
    try {
        const { telegramId, bidAmount } = req.body;
        const { auctionId } = req.params;
        // Get the user
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const auction = await auctionService.placeBid(auctionId, user.id, bidAmount);
        res.json(auction);
    } catch (err) {
        console.error('Error placing bid:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auctions/:auctionId/close – Close an auction
router.post('/:auctionId/close', async (req, res) => {
    try {
        const { telegramId } = req.body;
        const { auctionId } = req.params;
        // Get the user
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const result = await auctionService.closeAuction(auctionId, user.id);
        res.json(result);
    } catch (err) {
        console.error('Error closing auction:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auctions – List all open auctions
router.get('/', async (req, res) => {
    try {
        const { Auction } = models;
        const auctions = await Auction.findAll({
            where: { status: 'open' },
            order: [['endsAt', 'ASC']],
        });
        res.json(auctions);
    } catch (err) {
        console.error('Error listing auctions:', err);
        res.status(500).json({ error: 'Failed to list auctions' });
    }
});

module.exports = router;
