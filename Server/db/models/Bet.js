// // server/db/models/Bet.js
// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//     const Bet = sequelize.define('Bet', {
//         id: {
//             type: DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true,
//         },
//         userId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//         },
//         matchId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//         },
//         selection: {
//             // e.g. 'home', 'away', or 'draw'
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         stake: {
//             // how many coins the user bets
//             type: DataTypes.INTEGER,
//             allowNull: false,
//         },
//         odds: {
//             // store the odds at the time of placing the bet
//             type: DataTypes.FLOAT,
//             allowNull: false,
//         },
//         status: {
//             // 'pending', 'won', 'lost', 'canceled', etc.
//             type: DataTypes.STRING,
//             defaultValue: 'pending',
//         },
//         payout: {
//             // how many coins paid out if user wins (can be calculated after match finishes)
//             type: DataTypes.FLOAT,
//             allowNull: true,
//         },
//     }, {
//         tableName: 'Bets',
//     });

//     return Bet;
// };

// backend/db/models/Bet.js
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
        cardId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    });
    return Bet;
};
