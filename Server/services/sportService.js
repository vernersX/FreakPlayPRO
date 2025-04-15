const axios = require('axios');
const { Sport } = require('../db/init').models;
const { ODDS_API_KEY } = process.env;

async function fetchAllSports() {
    try {
        const response = await axios.get('https://api.the-odds-api.com/v4/sports', {
            params: {
                apiKey: ODDS_API_KEY,
                regions: 'us,eu', // both US and EU
            },
        });
        return response.data; // an array of sport objects
    } catch (error) {
        console.error('Error fetching sports:', error);
        throw error;
    }
}

async function updateAllSports() {
    try {
        const allSports = await fetchAllSports();

        // Upsert each sport into the DB
        for (const sport of allSports) {
            await Sport.upsert({
                key: sport.key,
                title: sport.title,
                description: sport.description || '',
                group: sport.group || '',
                active: sport.active,
                has_outrights: sport.has_outrights,
            });
        }
        return allSports.length;
    } catch (error) {
        console.error('Error updating sports:', error);
        throw error;
    }
}

module.exports = {
    fetchAllSports,
    updateAllSports,
};
