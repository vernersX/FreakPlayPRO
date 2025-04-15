// services/matchService.js
const axios = require('axios');
const { Match, Sport } = require('../db/init').models;
const { ODDS_API_KEY } = process.env;

// This function fetches matches for a given sportKey.
async function fetchMatchesForSport(sportKey) {
    try {
        // Adjust the endpoint if needed – many APIs allow you to get odds/matches for a specific sport.
        const response = await axios.get(
            `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`,
            {
                params: {
                    apiKey: ODDS_API_KEY,
                    regions: 'us,eu',
                    markets: 'h2h', // or any other market you require
                },
            }
        );
        return response.data; // assuming it returns an array of match objects
    } catch (error) {
        console.error(`Error fetching matches for sport ${sportKey}:`, error);
        return [];
    }
}

async function updateAllMatches() {
    try {
        // First, retrieve all active sports from the Sports table.
        const sports = await Sport.findAll({ where: { active: true } });
        let totalMatchesCount = 0;

        // Loop over each sport and fetch matches for it.
        for (const sport of sports) {
            const sportKey = sport.key;
            console.log(`Fetching matches for sport: ${sportKey}`);
            const matches = await fetchMatchesForSport(sportKey);

            // Upsert each match record, including the league info from the match object.
            for (const match of matches) {
                await Match.upsert({
                    apiMatchId: match.id, // use the API's match ID
                    sportKey: sportKey,
                    homeTeam: match.home_team,
                    awayTeam: match.away_team,
                    commenceTime: new Date(match.commence_time),
                    homeOdds: match.odds ? match.odds.home : null,
                    awayOdds: match.odds ? match.odds.away : null,
                    drawOdds: match.odds ? match.odds.draw : null,
                    league: match.league, // make sure the API returns this field
                });
            }
            totalMatchesCount += matches.length;
        }
        console.log(`Total matches updated: ${totalMatchesCount}`);
        return totalMatchesCount;
    } catch (error) {
        console.error('Error updating matches:', error);
        throw error;
    }
}

module.exports = {
    fetchMatchesForSport,
    updateAllMatches,
};
