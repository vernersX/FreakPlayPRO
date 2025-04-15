// db/models/Match.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Match = sequelize.define('Match', {
        apiMatchId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        sportKey: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        homeTeam: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        awayTeam: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        commenceTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        homeOdds: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        awayOdds: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        drawOdds: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        outcome: {
            type: DataTypes.STRING, // e.g., 'home', 'away', 'draw'
            allowNull: true,
        },
        league: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // New fields:
        sportTitle: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sportDescription: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        group: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    });
    return Match;
};
