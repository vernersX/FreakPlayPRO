const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        telegramId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coins: {
            type: DataTypes.FLOAT,
            defaultValue: 1000, // starting coins
        },
        // in models/user.js
        avatarUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gamesPlayed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        cardsOwned: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        betsPlaced: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        ranking: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
    });
    return User;
};
