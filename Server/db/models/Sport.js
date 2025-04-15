const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Sport = sequelize.define('Sport', {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true, // Using the sport key as the primary key (e.g., "soccer_epl")
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        group: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        has_outrights: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });
    return Sport;
};
