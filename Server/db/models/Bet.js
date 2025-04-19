const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Bet = sequelize.define('Bet', {
        selection: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stake: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        odds: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING, // 'pending', 'won', 'lost'
            allowNull: false,
        },
        payout: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        cardIds: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    });
    return Bet;
};
