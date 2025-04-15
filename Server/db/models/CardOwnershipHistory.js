// db/models/CardOwnershipHistory.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CardOwnershipHistory = sequelize.define('CardOwnershipHistory', {
        fromUserId: {
            type: DataTypes.INTEGER,
            allowNull: true, // If minted or no previous owner
        },
        toUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        transferredAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });
    return CardOwnershipHistory;
};
