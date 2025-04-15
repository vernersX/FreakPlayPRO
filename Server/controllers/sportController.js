const { Sport } = require('../db/init').models;
const sportService = require('../services/sportService');

async function listSports(req, res) {
    try {
        const { group } = req.query;
        let sports;
        if (group) {
            sports = await req.app.get('models').Sport.findAll({ where: { group } });
        } else {
            sports = await req.app.get('models').Sport.findAll();
        }
        res.json(sports);
    } catch (error) {
        console.error('Error fetching sports:', error);
        res.status(500).json({ error: 'Failed to fetch sports' });
    }
}

async function updateSports(req, res) {
    try {
        const count = await sportService.updateAllSports();
        res.json({ message: `Updated ${count} sports` });
    } catch (error) {
        console.error('Error updating sports:', error);
        res.status(500).json({ error: 'Failed to update sports' });
    }
}

async function getSportsByGroup(req, res) {
    try {
        const { group } = req.query;
        if (!group) {
            return res.status(400).json({ error: 'Group parameter is required' });
        }
        const sports = await Sport.findAll({ where: { group } });
        res.json(sports); // Return an array of sport records (each should have at least key and title).
    } catch (error) {
        console.error('Error fetching sports:', error);
        res.status(500).json({ error: 'Failed to fetch sports' });
    }
}

module.exports = { listSports, updateSports, getSportsByGroup };
