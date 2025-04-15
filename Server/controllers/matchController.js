// controllers/matchController.js
const { models } = require('../db/init');
const { Match, Sport } = models;
const { Op } = require('sequelize');
const matchService = require('../services/matchService');

async function getUpcomingMatches(req, res) {
    try {
        const { sportKey, league, group } = req.query;
        const whereClause = {};
        const now = new Date();
        whereClause.commenceTime = { [Op.gt]: now };

        if (group) {
            // Find all sports that belong to the given group.
            const sportsInGroup = await Sport.findAll({ where: { group } });
            const sportKeysInGroup = sportsInGroup.map(s => s.key);
            // Filter: match records where either group is set to the provided group
            // OR group is NULL but sportKey is in the set of sportKeys for that group.
            whereClause[Op.or] = [
                { group: group },
                { group: null, sportKey: { [Op.in]: sportKeysInGroup } }
            ];
            // If a specific sportKey is provided in addition to group, add an extra condition.
            if (sportKey) {
                whereClause.sportKey = sportKey;
            }
        } else if (sportKey) {
            // Fallback if no group is provided.
            whereClause.sportKey = sportKey;
        }

        if (league) {
            whereClause.league = league;
        }

        const matches = await Match.findAll({
            where: whereClause,
            order: [['commenceTime', 'ASC']],
        });

        res.json(matches);
    } catch (error) {
        console.error('Error fetching upcoming matches:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateMatches(req, res) {
    try {
        const count = await matchService.updateAllMatches();
        res.json({ message: `Updated ${count} matches` });
    } catch (error) {
        console.error('Error updating matches:', error);
        res.status(500).json({ error: 'Failed to update matches' });
    }
}

module.exports = { getUpcomingMatches, updateMatches };
