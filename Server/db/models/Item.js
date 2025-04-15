// db/models/Item.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Item = sequelize.define('Item', {
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    });
    return Item;
};
