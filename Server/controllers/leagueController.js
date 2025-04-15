// controllers/leagueController.js
const axios = require('axios');
const { Op } = require('sequelize'); // Import Op for [Op.in] usage.
const { League, Sport } = require('../db/init').models; // Import both models.
const { ODDS_API_KEY } = process.env;

async function listLeagues(req, res) {
    try {
        const { sportKey, group } = req.query;

        // If a group parameter is provided, use it to fetch the leagues.
        if (group) {
            // 1) Find all sports in the given group.
            const sportsInGroup = await Sport.findAll({ where: { group } });
            if (!sportsInGroup.length) {
                return res.json([]);
            }
            const sportKeysInGroup = sportsInGroup.map(s => s.key);

            // 2) Find all leagues in the League table that have a sportKey in that set.
            const dbLeagues = await League.findAll({
                where: {
                    sportKey: { [Op.in]: sportKeysInGroup }
                }
            });
            // Extract league names.
            const leagueNames = dbLeagues.map(l => l.name);
            // Deduplicate if necessary.
            return res.json(Array.from(new Set(leagueNames)));
        }

        // If group parameter isn't provided but sportKey is, use the existing logic.
        if (!sportKey) {
            return res.status(400).json({ error: 'Either "group" or "sportKey" is required' });
        }

        // Existing logic using sportKey:
        const response = await axios.get(
            `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`,
            { params: { apiKey: ODDS_API_KEY, regions: 'us', markets: 'h2h' } }
        );
        const matches = response.data;
        console.log('Raw matches data:', matches);

        const leaguesSet = new Set();
        matches.forEach(match => {
            if (match.league) {
                leaguesSet.add(match.league);
            }
        });
        const leagues = Array.from(leaguesSet);
        console.log('Extracted leagues:', leagues);

        // Optionally, upsert these leagues into your DB for global use.
        for (const leagueName of leagues) {
            await League.upsert({ sportKey, name: leagueName });
        }

        res.json(leagues);
    } catch (error) {
        console.error('Error listing leagues:', error);
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
}

module.exports = { listLeagues };
