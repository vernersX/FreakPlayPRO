const axios = require('axios');
const { models } = require('../db/init');
const { Op } = require('sequelize');
const { Match, Sport } = models;

// Helper to parse odds from API response
function parseOdds(matchFromApi) {
  let homeOdds = null;
  let awayOdds = null;
  let drawOdds = null;

  if (matchFromApi.bookmakers && matchFromApi.bookmakers.length > 0) {
    const firstBookmaker = matchFromApi.bookmakers[0];
    const h2hMarket = firstBookmaker.markets.find(m => m.key === 'h2h');
    if (h2hMarket?.outcomes) {
      h2hMarket.outcomes.forEach((outcome) => {
        if (outcome.name === matchFromApi.home_team) {
          homeOdds = outcome.price;
        } else if (outcome.name === matchFromApi.away_team) {
          awayOdds = outcome.price;
        } else {
          drawOdds = outcome.price;
        }
      });
    }
  }
  return { homeOdds, awayOdds, drawOdds };
}

async function fetchAllOdds() {
  try {
    // Retrieve only active sports in the groups we care about:
    const validGroups = ["Soccer", "Basketball", "Ice Hockey", "Mixed Martial Arts"];
    const sports = await Sport.findAll({
      where: {
        active: true,
        group: { [Op.in]: validGroups }
      }
    });
    // Build a mapping to include title/description and get sport keys.
    const sportMapping = {};
    const sportKeys = sports.map(sport => {
      sportMapping[sport.key] = sport;
      return sport.key;
    });

    // Proceed with making API calls for each sport (or use a consolidated call if supported)
    // (If you still need to make individual calls, you can use Promise.all as before.)
    const fetchPromises = sportKeys.map(sportKey => {
      const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`;
      const params = {
        apiKey: process.env.ODDS_API_KEY,
        regions: 'us',
        markets: 'h2h',
        oddFormat: 'decimal',
        dateFormat: 'iso'
      };
      return axios.get(url, { params })
        .then(response => ({ sportKey, oddsData: response.data }))
        .catch(error => {
          console.error(`Error fetching odds for ${sportKey}: ${error.message}`);
          return { sportKey, oddsData: [] };
        });
    });

    const results = await Promise.all(fetchPromises);
    let totalMatches = 0;
    for (const result of results) {
      const { sportKey, oddsData } = result;
      const sport = sportMapping[sportKey];
      const upcomingGames = oddsData.map(apiMatch => {
        const { homeOdds, awayOdds, drawOdds } = parseOdds(apiMatch);
        return {
          apiMatchId: apiMatch.id,
          sportKey,
          homeTeam: apiMatch.home_team,
          awayTeam: apiMatch.away_team,
          commenceTime: apiMatch.commence_time,
          homeOdds,
          awayOdds,
          drawOdds,
          league: apiMatch.league || null,
          sportTitle: sport.title,
          sportDescription: sport.description,
          group: sport.group
        };
      });
      totalMatches += upcomingGames.length;
      for (const game of upcomingGames) {
        await Match.upsert(game);
      }
      console.log(`Upserted ${upcomingGames.length} matches for ${sportKey}.`);
    }
    console.log(`Upserted a total of ${totalMatches} matches for all selected sports.`);
  } catch (error) {
    console.error('Error fetching all odds:', error.message || error);
  }
}

function determineWinnerFromScores(scoresArray, homeTeamName, awayTeamName) {
  if (!scoresArray || scoresArray.length < 2) {
    return null;
  }
  const home = scoresArray.find(s => s.name === homeTeamName);
  const away = scoresArray.find(s => s.name === awayTeamName);
  if (!home || !away) return null;
  if (home.score > away.score) return 'home';
  if (away.score > home.score) return 'away';
  return 'draw';
}

async function resolveMatches() {
  try {
    // Retrieve active sports in the groups you care about.
    const validGroups = ["Soccer", "Basketball", "Ice Hockey", "Mixed Martial Arts"];
    const sports = await Sport.findAll({
      where: {
        active: true,
        group: { [Op.in]: validGroups }
      }
    });

    // Iterate over each sport and fetch scores.
    for (const sport of sports) {
      const sportKey = sport.key;
      const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/scores`;
      const params = {
        apiKey: process.env.ODDS_API_KEY,
        daysFrom: 3,
      };
      try {
        const response = await axios.get(url, { params });
        const matchScores = response.data;

        for (const matchObj of matchScores) {
          if (!matchObj.completed) continue;

          // Find the match in the DB by its API match ID.
          const dbMatch = await Match.findOne({ where: { apiMatchId: matchObj.id } });
          if (!dbMatch) continue;

          // Find pending bets on this match.
          const pendingBets = await models.Bet.findAll({
            where: { matchId: dbMatch.id, status: 'pending' },
          });
          if (!pendingBets.length) continue;

          // Determine the winner based on scores.
          const winner = determineWinnerFromScores(matchObj.scores, dbMatch.homeTeam, dbMatch.awayTeam);
          if (!winner) continue;

          // Update each pending bet.
          for (const bet of pendingBets) {
            const card = await models.Card.findByPk(bet.cardId);
            if (bet.selection === winner) {
              const payout = bet.stake * bet.odds;
              bet.status = 'won';
              bet.payout = payout;
              await bet.save();

              if (card) {
                // set a 1‑hour cooldown from now
                card.cooldownUntil = new Date(Date.now() + 1 * 60 * 60 * 1000);
                card.winStreak = 0;
                card.isLocked = false;
                await card.save();
              }

              const user = await models.User.findByPk(bet.userId);
              if (user) {
                user.coins += payout;
                await user.save();
              }
            } else {
              bet.status = 'lost';
              bet.payout = 0;
              await bet.save();

              if (card) {
                card.lives -= 1;
                card.winStreak = 0;
                card.isLocked = false;
                await card.save();
              }
            }
          }
        }
        console.log(`Resolved matches for sport: ${sportKey}`);
      } catch (error) {
        console.error(`Error resolving matches for sport: ${sportKey}: ${error.message}`);
      }
    }
    console.log('Auto-resolve complete using The Odds API.');
  } catch (error) {
    console.error('Error auto-resolving matches:', error);
  }
}


module.exports = { fetchAllOdds, resolveMatches };
