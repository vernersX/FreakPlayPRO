// db/models/Bid.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Bid = sequelize.define('Bid', {
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    });
    return Bid;
};
