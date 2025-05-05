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
        hasShield: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        // for items to define their base cooldown depending on rarity
        baseCooldownMultiplier: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 1.0
        },
        // for stopwatch items and other buffs
        // this is the multiplier that will be applied to the base cooldown multiplier
        // e.g. 0.5 = 50% faster, 2 = 2x slower
        cooldownMultiplier: {
            type: DataTypes.FLOAT,
            defaultValue: 1.0      // 1 = normal speed
        },
        stopwatchActivatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        stopwatchExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        coinBoostMultiplier: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 1
        },
        coinBoostExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    });
    return Card;
};
