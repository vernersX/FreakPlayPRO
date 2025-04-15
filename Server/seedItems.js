// seed_items.js
require('dotenv').config();
const { connectToDB, models, sequelize } = require('./db/init'); // Import sequelize here
const { Item } = models;

async function seedItems() {
    try {
        await connectToDB();
        // Disable foreign key checks
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
        await Item.truncate();
        // Re-enable foreign key checks
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

        // Define the marketplace items with metadata including imageUrl
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
                    description: 'Refill a card’s lives to max',
                    imageUrl: '/item-imgs/AirPump.png'
                },
            },
            {
                type: 'mystery_box',
                metadata: {
                    price: 80,
                    description: 'Contains a random surprise reward!',
                    imageUrl: '/item-imgs/MysteryBox.png'
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
