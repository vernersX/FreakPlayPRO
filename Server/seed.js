// Server/seed.js

require('dotenv').config();
const { connectToDB, syncModels, models } = require('./db/init');
const { User, Card } = models;

async function seed() {
    try {
        // 1) connect & sync all models (drops tables in dev if you have dropAndSync in syncModels)
        await connectToDB();
        await syncModels();

        // 2) create or find a demo user
        const [theUser] = await User.findOrCreate({
            where: { telegramId: '926460821' },
            defaults: { username: 'BossCaptain' }
        });

        // 3) define the full rarity ladder
        const cardTypes = [
            {
                rarity: 'rookie',     // Tennis ball
                baseValue: 5,
                imageURL: '/card-imgs/CardTennisBall.webp'
            },
            {
                rarity: 'tactician',  // American football ball
                baseValue: 15,
                imageURL: '/card-imgs/CardRugbyBall.webp'
            },
            {
                rarity: 'playmaker',  // Basketball
                baseValue: 30,
                imageURL: '/card-imgs/CardBasketBall.webp'
            },
            {
                rarity: 'striker',    // Football (soccer)
                baseValue: 60,
                imageURL: '/card-imgs/CardFootballBall.png'
            },
            {
                rarity: 'allstar',    // Trophy ball
                baseValue: 120,
                imageURL: '/card-imgs/CardTrophyBall.png'
            }
        ];

        // 4) helper: create `count` random cards for a user
        async function createRandomCardsForUser(user, count = 5) {
            for (let i = 0; i < count; i++) {
                const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
                await Card.create({
                    userId: user.id,
                    rarity: randomType.rarity,
                    baseValue: randomType.baseValue,
                    imageURL: randomType.imageURL,
                    // starting attributes
                    cooldownUntil: null,
                    winStreak: 0,
                    isLocked: false
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
