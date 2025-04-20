// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { sequelize } = db;
const { Bet, Card, User } = db.models;

router.post('/unlock-all', async (req, res, next) => {
    try {
        await sequelize.transaction(async (tx) => {
            // 1) Resolve all pending bets as “won”
            await Bet.update(
                { status: 'won' },
                { where: { status: 'pending' }, transaction: tx }
            );

            // ─── JS‑land payout logic ────────────────────────────────────────────────
            // Fetch all bets we just marked won
            const wonBets = await Bet.findAll({
                where: { status: 'won' },
                transaction: tx
            });

            // Sum up payouts per user
            const payoutsByUser = wonBets.reduce((map, bet) => {
                map[bet.userId] = (map[bet.userId] || 0) + bet.payout;
                return map;
            }, {});

            // Increment each user’s coins by their total payout
            for (let [userId, sum] of Object.entries(payoutsByUser)) {
                await User.increment(
                    'coins',
                    { by: sum, where: { id: userId }, transaction: tx }
                );
            }
            // ─────────────────────────────────────────────────────────────────────────

            // 3) Unlock every card
            await Card.update(
                { isLocked: false, cooldownUntil: null },
                { where: {}, transaction: tx }
            );
        });

        res.json({
            success: true,
            message: 'All pending bets won, payouts applied, and cards unlocked.'
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
