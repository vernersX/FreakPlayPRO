// Server/controllers/betController.js

const { models, sequelize } = require('../db/init');
const { User, Match, Bet, Card } = models;
const { Op } = require('sequelize');

async function placeBet(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { telegramId, matchId, predictedOutcome, cardIds } = req.body;
        const selection = predictedOutcome;

        // Validate that we got an array of 1–3 card IDs
        if (!Array.isArray(cardIds) || cardIds.length < 1 || cardIds.length > 3) {
            await transaction.rollback();
            return res.status(400).json({ error: 'You must bet with between 1 and 3 cards' });
        }

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

        // 3) Fetch all requested cards
        const cards = await Card.findAll({
            where: { id: cardIds },
            transaction
        });
        if (cards.length !== cardIds.length) {
            await transaction.rollback();
            return res.status(404).json({ error: 'One or more cards not found' });
        }

        // 4) Ensure ownership and availability
        for (const c of cards) {
            // now comparing numeric user.id
            if (c.userId !== user.id) {
                await transaction.rollback();
                return res.status(400).json({ error: 'One or more cards do not belong to you' });
            }
            if (c.isLocked) {
                await transaction.rollback();
                return res.status(400).json({ error: 'One or more cards are currently in use' });
            }
        }

        // 5) Determine odds
        let oddsValue;
        if (selection === 'home') oddsValue = match.homeOdds;
        else if (selection === 'away') oddsValue = match.awayOdds;
        else if (selection === 'draw') oddsValue = match.drawOdds;
        if (!oddsValue) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Invalid selection or odds not available' });
        }

        // 6) Lock all cards
        for (const c of cards) {
            c.isLocked = true;
            await c.save({ transaction });
        }

        // 7) Compute total stake
        const totalStake = cards.reduce((sum, c) => sum + c.baseValue, 0);

        // 8) Create the Bet record, using numeric user.id for the FK
        const newBet = await Bet.create({
            userId: user.id,          // ← use user.id, not telegramId
            matchId: match.id,
            selection,
            stake: totalStake,
            odds: oddsValue,
            status: 'pending',
            payout: null,
            cardIds                 // JSON array of selected card IDs
        }, { transaction });

        await transaction.commit();
        return res.json({ message: 'Bet placed successfully', bet: newBet });

    } catch (err) {
        await transaction.rollback();
        console.error('Error placing bet:', err);
        return res.status(400).json({ error: err.message || 'Internal Server Error' });
    }
}

async function getMyBets(req, res) {
    try {
        const { telegramId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 1) fetch bets with match info only
        const rawBets = await Bet.findAll({
            where: { userId: user.id, status: 'pending' },
            include: [Match],       // ← drop Card here
        });

        // 2) for each bet, load its cards
        const betsWithCards = await Promise.all(
            rawBets.map(async bet => {
                const betJson = bet.toJSON();
                const cards = await Card.findAll({
                    where: { id: betJson.cardIds }
                });
                return { ...betJson, Cards: cards };
            })
        );

        res.json(betsWithCards);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getBetHistory(req, res) {
    try {
        const { telegramId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 1) Fetch all completed bets (won or lost) with match info only
        const rawHistory = await Bet.findAll({
            where: {
                userId: user.id,
                status: { [Op.in]: ['won', 'lost'] }
            },
            include: [Match]
        });

        // 2) For each bet, load all Cards whose IDs are in bet.cardIds
        const historyWithCards = await Promise.all(
            rawHistory.map(async bet => {
                const betJson = bet.toJSON();
                const cardsUsed = await Card.findAll({
                    where: { id: betJson.cardIds }
                });
                return {
                    ...betJson,
                    Cards: cardsUsed
                };
            })
        );

        res.json(historyWithCards);
    } catch (error) {
        console.error('Error fetching bet history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getBetForMatch(req, res) {
    try {
        const { telegramId, matchId } = req.query;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
            // No user → no bet
            return res.json(null);
        }

        // 1) Find any pending bet on this match for the user
        const rawBet = await Bet.findOne({
            where: {
                userId: user.id,
                matchId,
                status: 'pending'
            },
            include: [Match]
        });
        if (!rawBet) {
            return res.json(null);
        }

        // 2) Load all Cards from the bet.cardIds array
        const betJson = rawBet.toJSON();
        const cardsUsed = await Card.findAll({
            where: { id: betJson.cardIds }
        });

        res.json({
            ...betJson,
            Cards: cardsUsed
        });
    } catch (error) {
        console.error('Error fetching bet for match:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    placeBet,
    getMyBets,
    getBetHistory,
    getBetForMatch
};
