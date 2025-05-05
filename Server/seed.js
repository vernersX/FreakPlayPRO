// Server/seed.js

require('dotenv').config();
const { connectToDB, syncModels, models } = require('./db/init');
const { User, Card } = models;
const { RARITY_LEVELS, RARITY_DEFINITIONS } = require('./constants/rarities');

async function seed() {
  try {
    // 1) connect & sync all models (drops tables in dev if syncModels does that)
    await connectToDB();
    await syncModels();

    // 2) create or find a demo user
    const [theUser] = await User.findOrCreate({
      where:    { telegramId: '926460821' },
      defaults: { username: 'BossCaptain' }
    });

    // 3) build the full rarity ladder from our shared constants
    const cardTypes = RARITY_LEVELS.map(rarity => ({
      rarity,
      baseValue:              RARITY_DEFINITIONS[rarity].baseValue,
      imageURL:               RARITY_DEFINITIONS[rarity].imageURL,
      baseCooldownMultiplier: RARITY_DEFINITIONS[rarity].baseCooldownMultiplier,
    }));

    // 4) helper: create `count` random cards for a user
    async function createRandomCardsForUser(user, count = 5) {
      for (let i = 0; i < count; i++) {
        const randomType = cardTypes[
          Math.floor(Math.random() * cardTypes.length)
        ];

        await Card.create({
          userId:                 user.id,
          rarity:                 randomType.rarity,
          baseValue:              randomType.baseValue,
          imageURL:               randomType.imageURL,
          baseCooldownMultiplier: randomType.baseCooldownMultiplier,
          cooldownMultiplier:     1.0,   // no active buff on fresh cards
          cooldownUntil:          null,
          winStreak:              0,
          isLocked:               false,
        });
      }
    }

    // 5) seed 6 cards onto our demo user
    await createRandomCardsForUser(theUser, 6);

    console.log('✅ Seeding complete!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
