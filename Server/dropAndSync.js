// dropAndSync.js
require('dotenv').config();
const { sequelize } = require('./db/init'); // Make sure your db/init.js exports 'sequelize'

async function dropAndSync() {
    try {
        // Drop all tables in the database
        await sequelize.drop();
        console.log('All tables dropped successfully.');

        // Recreate all tables based on your models
        await sequelize.sync({ force: true });
        console.log('All tables re-created successfully.');

        process.exit(0);
    } catch (error) {
        console.error('Error dropping/re-syncing tables:', error);
        process.exit(1);
    }
}

dropAndSync();
