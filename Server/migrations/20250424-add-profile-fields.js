'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Users', 'avatarUrl', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('Users', 'gamesPlayed', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('Users', 'cardsOwned', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('Users', 'betsPlaced', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('Users', 'ranking', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('Users', 'avatarUrl');
        await queryInterface.removeColumn('Users', 'gamesPlayed');
        await queryInterface.removeColumn('Users', 'cardsOwned');
        await queryInterface.removeColumn('Users', 'betsPlaced');
        await queryInterface.removeColumn('Users', 'ranking');
    }
};
