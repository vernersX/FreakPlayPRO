const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        telegramId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primarykey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coins: {
            type: DataTypes.FLOAT,
            defaultValue: 1000, // starting coins
        },
    });
    return User;
};
