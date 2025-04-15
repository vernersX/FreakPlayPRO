// routes/cards.js
const express = require('express');
const router = express.Router();
const { models } = require('../db/init');
const cardService = require('../services/cardService');
const { Card, CardOwnershipHistory, Bet, User } = models;


// Create a new card
router.post('/', async (req, res) => {
    try {
        const { userId, rarity, baseValue, maxLives, imageURL } = req.body;
        const card = await cardService.createCard(userId, rarity, baseValue, maxLives, imageURL);
        res.json(card);
    } catch (err) {
        console.error('Error creating card:', err);
        res.status(500).json({ error: 'Failed to create card' });
    }
});

// Transfer card
router.post('/transfer', async (req, res) => {
    try {
        const { cardId, fromUserId, toUserId } = req.body;
        const updatedCard = await cardService.transferCard(cardId, fromUserId, toUserId);
        res.json(updatedCard);
    } catch (err) {
        console.error('Error transferring card:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/cards/:id – Get card details including ownership & match history
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const card = await Card.findByPk(id);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Get ownership history for this card
        const ownershipHistory = await CardOwnershipHistory.findAll({
            where: { cardId: id },
            order: [['transferredAt', 'DESC']],
            include: [
                { model: User, as: 'fromUser', attributes: ['telegramId', 'username'] },
                { model: User, as: 'toUser', attributes: ['telegramId', 'username'] },
            ],
        });

        // Get match history for this card (assuming bets store cardId)
        const matchHistory = await Bet.findAll({
            where: { cardId: id },
            order: [['createdAt', 'DESC']],
        });

        res.json({
            card,
            ownershipHistory,
            matchHistory,
        });
    } catch (err) {
        console.error('Error fetching card detail:', err);
        res.status(500).json({ error: 'Failed to fetch card details' });
    }
});

module.exports = router;