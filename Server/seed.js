// Server/seed.js

require('dotenv').config();

const { connectToDB, syncModels, models } = require('./db/init');
const { User, Card } = models;

async function seed() {
    try {
        await connectToDB();
        await syncModels();

        // Create or find a fake user
        const [theUser] = await User.findOrCreate({
            where: { telegramId: '926460821' },
            defaults: { username: 'BossCaptain' },
        });

        // Define some card types (no more maxLives)
        const cardTypes = [
            {
                rarity: 'common',
                baseValue: 5,
                imageURL: '/card-imgs/CardTennisBall.webp',
            },
            {
                rarity: 'rare',
                baseValue: 15,
                imageURL: '/card-imgs/CardRugbyBall.webp',
            },
            {
                rarity: 'epic',
                baseValue: 30,
                imageURL: '/card-imgs/CardBasketBall.webp',
            },
            // ...add as many as you like
        ];

        // Function to create random cards for a given user
        async function createRandomCardsForUser(user, count = 5) {
            for (let i = 0; i < count; i++) {
                const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
                await Card.create({
                    userId: user.id,
                    rarity: randomType.rarity,
                    baseValue: randomType.baseValue,
                    imageURL: randomType.imageURL,
                    // new field: cards start ready to use
                    cooldownUntil: null,
                    // reset any other attrs you rely on:
                    winStreak: 0,
                    isLocked: false,
                });
            }
        }

        // Seed 5 cards for our demo user
        await createRandomCardsForUser(theUser, 6);

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
}

seed();
