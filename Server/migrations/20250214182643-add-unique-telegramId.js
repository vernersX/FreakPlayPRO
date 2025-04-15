'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Retrieve all indexes on the Users table that involve the telegramId column
    const indexes = await queryInterface.sequelize.query(
      `SHOW INDEXES FROM Users WHERE Column_name = 'telegramId';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log('Indexes on telegramId:', indexes);

    // Loop over the indexes and drop duplicate indexes.
    // We'll keep the one we want (assumed to be named 'telegramId').
    for (const idx of indexes) {
      if (idx.Key_name !== 'PRIMARY' && idx.Key_name !== 'telegramId') {
        console.log(`Dropping duplicate index: ${idx.Key_name}`);
        await queryInterface.removeIndex('Users', idx.Key_name);
      }
    }

    // Now alter the telegramId column to be unique
    await queryInterface.changeColumn('Users', 'telegramId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse the change by removing the unique constraint if needed
    await queryInterface.changeColumn('Users', 'telegramId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
  },
};
