'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Bets', 'cardIds', {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: []
        });

        // drop the old single‑card foreign key
        await queryInterface.removeColumn('Bets', 'cardId');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Bets', 'cardId', {
            type: Sequelize.UUID,
            allowNull: false,
        });

        await queryInterface.removeColumn('Bets', 'cardIds');
    }
};
