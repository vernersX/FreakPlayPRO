// Server/services/oddsService.js

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
      h2hMarket.outcomes.forEach(outcome => {
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
    // 1) Get active sports in our supported groups
    const validGroups = [
      "Soccer",
      "Basketball",
      "Ice Hockey",
      "Mixed Martial Arts"
    ];
    const sports = await Sport.findAll({
      where: {
        active: true,
        group: { [Op.in]: validGroups }
      }
    });

    // 2) Build mapping and list of sportKeys
    const sportMapping = {};
    const sportKeys = sports.map(s => {
      sportMapping[s.key] = s;
      return s.key;
    });

    // 3) Fetch odds for each sport sequentially
    const allResults = [];
    for (const sportKey of sportKeys) {
      const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`;
      const params = {
        apiKey: process.env.ODDS_API_KEY,
        regions: 'us',
        markets: 'h2h',
        oddFormat: 'decimal',
        dateFormat: 'iso'
      };

      try {
        const response = await axios.get(url, { params });
        console.log(`✅ Fetched ${response.data.length} odds for ${sportKey}`);
        allResults.push({ sportKey, oddsData: response.data });
      } catch (err) {
        console.error(`⚠️ Error fetching odds for ${sportKey}: ${err.message}`);
        allResults.push({ sportKey, oddsData: [] });
      }
    }

    // 4) Upsert into DB
    let totalMatches = 0;
    for (const { sportKey, oddsData } of allResults) {
      const sport = sportMapping[sportKey];
      const games = oddsData.map(apiMatch => {
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

      totalMatches += games.length;
      for (const game of games) {
        await Match.upsert(game);
      }
      console.log(`🔄 Upserted ${games.length} matches for ${sportKey}`);
    }

    console.log(`🎉 Upserted a total of ${totalMatches} matches.`);
  } catch (err) {
    console.error('❌ Error fetching all odds:', err.message || err);
  }
}

function determineWinnerFromScores(scoresArray, homeTeamName, awayTeamName) {
  if (!scoresArray || scoresArray.length < 2) return null;
  const home = scoresArray.find(s => s.name === homeTeamName);
  const away = scoresArray.find(s => s.name === awayTeamName);
  if (!home || !away) return null;
  if (home.score > away.score) return 'home';
  if (away.score > home.score) return 'away';
  return 'draw';
}

async function resolveMatches() {
  try {
    const validGroups = [
      "Soccer",
      "Basketball",
      "Ice Hockey",
      "Mixed Martial Arts"
    ];
    const sports = await Sport.findAll({
      where: {
        active: true,
        group: { [Op.in]: validGroups }
      }
    });

    for (const sport of sports) {
      const sportKey = sport.key;
      const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/scores`;
      const params = {
        apiKey: process.env.ODDS_API_KEY,
        daysFrom: 3
      };

      try {
        const response = await axios.get(url, { params });
        const matchScores = response.data;

        for (const matchObj of matchScores) {
          if (!matchObj.completed) continue;

          const dbMatch = await Match.findOne({
            where: { apiMatchId: matchObj.id }
          });
          if (!dbMatch) continue;

          const pendingBets = await models.Bet.findAll({
            where: { matchId: dbMatch.id, status: 'pending' }
          });
          if (!pendingBets.length) continue;

          const winner = determineWinnerFromScores(
            matchObj.scores,
            dbMatch.homeTeam,
            dbMatch.awayTeam
          );
          if (!winner) continue;

          for (const bet of pendingBets) {
            const card = await models.Card.findByPk(bet.cardId);

            if (bet.selection === winner) {
              // Win
              const payout = bet.stake * bet.odds;
              bet.status = 'won';
              bet.payout = payout;
              await bet.save();

              if (card) {
                card.winStreak = (card.winStreak || 0) + 1;
                card.isLocked = false;
                await card.save();
              }

              const user = await models.User.findByPk(bet.userId);
              if (user) {
                user.coins += payout;
                await user.save();
              }
            } else {
              // Loss
              bet.status = 'lost';
              bet.payout = 0;
              await bet.save();

              if (card) {
                card.winStreak = 0;
                card.isLocked = false;
                card.cooldownUntil = new Date(Date.now() + 1 * 60 * 60 * 1000);
                await card.save();
              }
            }
          }
        }

        console.log(`🔍 Resolved matches for ${sportKey}`);
      } catch (err) {
        console.error(`⚠️ Error resolving ${sportKey}: ${err.message}`);
      }
    }

    console.log('✅ Auto-resolve complete.');
  } catch (err) {
    console.error('❌ Error auto-resolving matches:', err);
  }
}

module.exports = { fetchAllOdds, resolveMatches };
