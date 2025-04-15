'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, retrieve all indexes on the Matches table that involve the column 'apiMatchId'
    const indexes = await queryInterface.sequelize.query(
      `SHOW INDEXES FROM Matches WHERE Column_name = 'apiMatchId';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Log for debugging
    console.log('Indexes on apiMatchId:', indexes);

    // Loop over the indexes and drop each one except (optionally) the one we want to keep.
    // For simplicity, we drop all non-primary indexes on apiMatchId.
    for (const idx of indexes) {
      // Skip the PRIMARY key, but drop any other index on apiMatchId.
      if (idx.Key_name !== 'PRIMARY') {
        console.log(`Dropping index: ${idx.Key_name}`);
        await queryInterface.removeIndex('Matches', idx.Key_name);
      }
    }

    // Now alter the column to be unique.
    // Note: if a unique index is already created by MySQL after dropping, this should work.
    await queryInterface.changeColumn('Matches', 'apiMatchId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse the unique constraint if needed.
    await queryInterface.changeColumn('Matches', 'apiMatchId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
    // Note: This does not re-create the dropped duplicate indexes.
  }
};
