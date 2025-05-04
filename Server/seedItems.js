require('dotenv').config();
const { connectToDB, models, sequelize } = require('./db/init');
const { Item } = models;

async function seedItems() {
    try {
        await connectToDB();

        // Disable FK checks, truncate, then re‑enable
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
        await Item.truncate();
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

        const marketplaceItems = [
            {
                type: 'coin_boost',
                metadata: {
                    price: 50,
                    description: 'Boost a card’s coin earnings for a limited time',
                    boostAmount: 2,
                    duration: 86400000, // 24 hours in ms
                    imageUrl: '/item-imgs/CoinBooster.png'
                },
            },
            {
                type: 'refill_lives',
                metadata: {
                    price: 20,
                    description: 'Fully pumps up a ball, removing any cooldown',
                    imageUrl: '/item-imgs/AirPump.png'
                },
            },
            {
                type: 'ball_merge',
                metadata: {
                    price: 100,
                    description: 'Combine 2 cards of the same rarity into one of the next rarity.',
                    imageUrl: '/item-imgs/BallMerge.png'
                },
            },
            {
                type: 'stopwatch_bronze',
                metadata: {
                    price: 30,
                    description: 'Speeds up cooldowns of all cards by 1.5× for next 24h.',
                    multiplier: 1.5,
                    durationMs: 24 * 60 * 60 * 1000, // 24h in ms
                    imageUrl: '/item-imgs/StopwatchBronze.png'
                },
            },
            {
                type: 'stopwatch_silver',
                metadata: {
                    price: 50,
                    description: 'Speeds up cooldowns of all cards by 2× for next 24h.',
                    multiplier: 2.0,
                    durationMs: 24 * 60 * 60 * 1000, // 24h in ms
                    imageUrl: '/item-imgs/StopwatchSilver.png'
                },
            },
            {
                type: 'stopwatch_gold',
                metadata: {
                    price: 80,
                    description: 'Speeds up cooldowns of all cards by 3× for next 24h.',
                    multiplier: 3.0,
                    durationMs: 24 * 60 * 60 * 1000, // 24h in ms
                    imageUrl: '/item-imgs/StopwatchGold.png'
                },
            },
            {
                type: 'shield',
                metadata: {
                    price: 40,
                    description: 'Protects a card from going on cooldown after a lost bet.',
                    imageUrl: '/item-imgs/Shield.png'
                },
            },
            {
                type: 'mystery_box_classic',
                metadata: {
                    price: 80,
                    description: 'Grants 1 random card of any rarity.',
                    imageUrl: '/item-imgs/MysteryBox.png'
                },
            },
            {
                type: 'mystery_box_professional',
                metadata: {
                    price: 120,
                    description: 'Grants 1 random card from Playmaker rarity or above.',
                    imageUrl: '/item-imgs/MysteryBoxPro.png'
                },
            },
            {
                type: 'mystery_skin_box',
                metadata: {
                    price: 150,
                    description: 'Grants 1 random skin for any card (skins coming soon!).',
                    imageUrl: '/item-imgs/MysterySkinBox.png'
                },
            },
        ];

        await Item.bulkCreate(marketplaceItems);
        console.log('Marketplace items seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding items:', err);
        process.exit(1);
    }
}

seedItems();
