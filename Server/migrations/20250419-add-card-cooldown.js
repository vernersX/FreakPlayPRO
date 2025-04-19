// migrations/20250419-add-card-cooldown.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Cards', 'cooldownUntil', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        // Optionally drop the old lives column:
        await queryInterface.removeColumn('Cards', 'lives');
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Cards', 'lives', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        });
        await queryInterface.removeColumn('Cards', 'cooldownUntil');
    }
};
