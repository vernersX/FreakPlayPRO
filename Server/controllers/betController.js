// controllers/betController.js
const { models, sequelize } = require('../db/init');
const { User, Match, Bet, Card } = models;
const { Op } = require('sequelize');

async function placeBet(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const { telegramId, matchId, selection, cardId } = req.body;

        // 1) Find user by telegramId
        const user = await User.findOne(
            { where: { telegramId } },
            { transaction }
        );
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        // 2) Find match
        const match = await Match.findByPk(matchId, { transaction });
        if (!match) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Match not found' });
        }

        // 3) Retrieve the card
        const card = await Card.findByPk(cardId, { transaction });
        if (!card) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Card not found' });
        }

        // Ensure the card belongs to this user (by telegramId)
        if (card.userId !== user.telegramId) {
            await transaction.rollback();
            return res.status(400).json({ error: 'This card does not belong to you' });
        }
        if (card.isLocked) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Card is currently in use' });
        }

        // 4) Determine odds
        let oddsValue;
        if (selection === 'home') oddsValue = match.homeOdds;
        else if (selection === 'away') oddsValue = match.awayOdds;
        else if (selection === 'draw') oddsValue = match.drawOdds;
        if (!oddsValue) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Invalid selection or odds not available' });
        }

        // 5) Lock card & create bet record (use telegramId as userId)
        card.isLocked = true;
        await card.save({ transaction });

        const newBet = await Bet.create({
            userId: user.telegramId,   // <<< use telegramId here
            matchId: match.id,
            selection,
            stake: card.baseValue,
            odds: oddsValue,
            status: 'pending',
            payout: null,
            cardId: card.id
        }, { transaction });

        await transaction.commit();
        res.json({ message: 'Bet placed successfully', bet: newBet });

    } catch (error) {
        await transaction.rollback();
        console.error('Error placing bet:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getMyBets(req, res) {
    try {
        const { telegramId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const pendingBets = await Bet.findAll({
            where: {
                userId: user.telegramId,   // <<< use telegramId
                status: 'pending'
            },
            include: [Match, Card]
        });
        res.json(pendingBets);

    } catch (error) {
        console.error('Error fetching my bets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getBetHistory(req, res) {
    try {
        const { telegramId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const finishedBets = await Bet.findAll({
            where: {
                userId: user.telegramId,   // <<< use telegramId
                status: { [Op.in]: ['won', 'lost'] }
            },
            include: [Match, Card]
        });
        res.json(finishedBets);

    } catch (error) {
        console.error('Error fetching bet history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getBetForMatch(req, res) {
    try {
        const { telegramId, matchId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.json(null);

        const existingBet = await Bet.findOne({
            where: {
                userId: user.telegramId,  // <<< use telegramId
                matchId,
                status: 'pending'
            },
            include: [Card]
        });

        return res.json(existingBet || null);
    } catch (error) {
        console.error('Error fetching bet for match:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { placeBet, getMyBets, getBetHistory, getBetForMatch };
