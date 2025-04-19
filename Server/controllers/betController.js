// Server/controllers/betController.js

const { models, sequelize } = require('../db/init');
const { User, Match, Bet, Card } = models;
const { Op } = require('sequelize');

/**
 * Place a new bet using 1–3 cards.
 */
async function placeBet(req, res) {
    const t = await sequelize.transaction();
    try {
        // pull everything from the POST body
        const { telegramId, matchId, predictedOutcome, cardIds } = req.body;

        // 1) Must have a telegramId
        if (!telegramId) {
            throw new Error('telegramId is required');
        }

        // 2) Look up the user by telegramId
        const user = await User.findOne(
            { where: { telegramId } },
            { transaction: t }
        );
        if (!user) {
            throw new Error('User not found');
        }

        // 3) Validate cardIds array length
        if (!Array.isArray(cardIds) || cardIds.length < 1 || cardIds.length > 3) {
            throw new Error('You must select 1–3 cards');
        }

        // 4) Fetch the match
        const match = await Match.findByPk(matchId, { transaction: t });
        if (!match) {
            throw new Error('Match not found');
        }

        // 5) Fetch & validate that every card belongs to this user
        const cards = await Card.findAll({
            where: { id: cardIds, userId: user.id },
            transaction: t,
        });
        if (cards.length !== cardIds.length) {
            throw new Error('One or more cards not found or not yours');
        }

        // 6) Check cooldown & lock each card, summing their baseValue
        let totalValue = 0;
        for (const card of cards) {
            if (card.cooldownUntil && new Date() < new Date(card.cooldownUntil)) {
                throw new Error(
                    `Card ${card.id} is cooling down until ${card.cooldownUntil.toISOString()}`
                );
            }
            if (card.isLocked) {
                throw new Error(`Card ${card.id} is already in use`);
            }
            totalValue += card.baseValue;
            card.isLocked = true;
            await card.save({ transaction: t });
        }

        // 7) Determine odds from the three separate fields
        let oddsValue;
        if (predictedOutcome === 'home') {
            oddsValue = match.homeOdds;
        } else if (predictedOutcome === 'draw') {
            oddsValue = match.drawOdds;
        } else if (predictedOutcome === 'away') {
            oddsValue = match.awayOdds;
        } else {
            throw new Error('Invalid predictedOutcome');
        }

        // 8) Create the bet record
        const bet = await Bet.create(
            {
                userId: user.id,
                matchId,
                selection: predictedOutcome,
                cardIds,
                stake: totalValue,
                odds: oddsValue,
                status: 'pending',
            },
            { transaction: t }
        );

        // 9) Commit & return
        await t.commit();
        return res.status(201).json(bet);
    } catch (err) {
        await t.rollback();
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Get all pending bets for a user (via ?telegramId=…).
 */
async function getMyBets(req, res) {
    try {
        const { telegramId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const pendingBets = await Bet.findAll({
            where: { userId: user.id, status: 'pending' },
            include: [Match, Card],
        });
        return res.json(pendingBets);
    } catch (err) {
        console.error('Error fetching my bets:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**
 * Get the bet history (won/lost) for a user.
 */
async function getBetHistory(req, res) {
    try {
        const { telegramId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const finishedBets = await Bet.findAll({
            where: {
                userId: user.id,
                status: { [Op.in]: ['won', 'lost'] },
            },
            include: [Match, Card],
        });
        return res.json(finishedBets);
    } catch (err) {
        console.error('Error fetching bet history:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**
 * Get the user's pending bet for a specific match (or null).
 */
async function getBetForMatch(req, res) {
    try {
        const { telegramId, matchId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.json(null);

        const existingBet = await Bet.findOne({
            where: { userId: user.id, matchId, status: 'pending' },
        });
        if (!existingBet) return res.json(null);

        // manually fetch the cards whose IDs you stored in the JSON column
        const cards = await Card.findAll({
            where: { id: existingBet.cardIds }
        });

        // merge them into the JSON you send back
        const payload = existingBet.toJSON();
        payload.Cards = cards;

        return res.json(payload);

    } catch (err) {
        console.error('Error fetching bet for match:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    placeBet,
    getMyBets,
    getBetHistory,
    getBetForMatch,
};
