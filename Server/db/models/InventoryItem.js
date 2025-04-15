// db/models/InventoryItem.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const InventoryItem = sequelize.define('InventoryItem', {
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    });
    return InventoryItem;
};
