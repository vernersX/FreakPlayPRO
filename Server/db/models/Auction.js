// db/models/Auction.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Auction = sequelize.define('Auction', {
        startingPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        currentPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        endsAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING, // 'open', 'closed'
            defaultValue: 'open',
        },
    });
    return Auction;
};
