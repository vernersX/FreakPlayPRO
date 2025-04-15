// backend/routes/inventory.js
const express = require('express');
const router = express.Router();
const { models } = require('../db/init');
const { listUserCards, listUserItems, useItem } = require('../services/inventoryService');

// GET /api/inventory/cards?telegramId=...
router.get('/cards', async (req, res) => {
    try {
        const { telegramId } = req.query;
        const { User } = models;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const cards = await listUserCards(user.id);
        res.json(cards);
    } catch (err) {
        console.error('Error fetching cards:', err);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// GET /api/inventory/items?telegramId=...
router.get('/items', async (req, res) => {
    try {
        const { telegramId } = req.query;
        const { User } = models;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const items = await listUserItems(user.telegramId);
        res.json(items);
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// POST /api/inventory/use-item
router.post('/use-item', async (req, res) => {
    try {
        const { telegramId, inventoryItemId, targetCardId } = req.body;
        const { User } = models;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const result = await useItem(user.telegramId, inventoryItemId, targetCardId);
        res.json(result);
    } catch (err) {
        console.error('Error using item:', err);
        res.status(500).json({ error: err.message || 'Failed to use item' });
    }
});

module.exports = router;
