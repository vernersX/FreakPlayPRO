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
        cooldownUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        hasShield : {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          cooldownMultiplier : {
            type: DataTypes.FLOAT,
            defaultValue: 1      // 1 = normal speed
          },
    });
    return Card;
};
