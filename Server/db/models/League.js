// db/models/League.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const League = sequelize.define('League', {
        // e.g., "soccer_epl", "soccer_italy_serie_a", etc.
        sportKey: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // e.g., "English Premier League", "Serie A", etc.
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Optional: country, region, or other metadata
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });
    return League;
};
