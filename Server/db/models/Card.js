// backend/db/models/Card.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Card = sequelize.define('Card', {
        rarity: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        baseValue: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        lives: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        maxLives: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        winStreak: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        imageURL: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isLocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    });
    return Card;
};
