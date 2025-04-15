// seed.js
require('dotenv').config();
const { connectToDB, syncModels, models } = require('./db/init');
const { User, Card } = models;

async function seed() {
    try {
        await connectToDB();
        await syncModels();

        // Create or find a fake user with telegramId '926460821'
        const [theUser] = await User.findOrCreate({
            where: { telegramId: '926460821' },
            defaults: { username: 'BossCaptain' },
        });

        // Define some card types with different rarity and properties
        const cardTypes = [
            { rarity: 'common', baseValue: 5, maxLives: 2, imageURL: '/card-imgs/CardTennisBall.webp' },
            // { rarity: 'common', baseValue: 5, maxLives: 2, imageURL: '/card-imgs/NeutralBall.png' },
            // { rarity: 'rare', baseValue: 10, maxLives: 3, imageURL: 'https://static.wikia.nocookie.net/nintendo/images/e/e1/Pokemon_Charizard_Card.jpg/revision/latest/scale-to-width-down/354?cb=20060906214618&path-prefix=en' },
            // { rarity: 'epic', baseValue: 20, maxLives: 4, imageURL: 'https://static.wikia.nocookie.net/nintendo/images/e/e1/Pokemon_Charizard_Card.jpg/revision/latest/scale-to-width-down/354?cb=20060906214618&path-prefix=en' },
            // { rarity: 'legendary', baseValue: 50, maxLives: 5, imageURL: 'https://static.wikia.nocookie.net/nintendo/images/e/e1/Pokemon_Charizard_Card.jpg/revision/latest/scale-to-width-down/354?cb=20060906214618&path-prefix=en' },
        ];

        // Function to create random cards for a given user
        async function createRandomCardsForUser(user, count = 5) {
            for (let i = 0; i < count; i++) {
                // Randomly pick one of the card types
                const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
                await Card.create({
                    userId: theUser.id, // Note the capital "U" to match the association's foreign key
                    rarity: randomType.rarity,
                    baseValue: randomType.baseValue,
                    lives: randomType.maxLives, // Start with full lives
                    maxLives: randomType.maxLives,
                    imageURL: randomType.imageURL,
                });
            }
        }

        // Create 3 random cards for the fetched user
        await createRandomCardsForUser(theUser, 5);

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
}

seed();
