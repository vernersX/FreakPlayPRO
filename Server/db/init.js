// db/init.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/config');

// Import models
const UserModel = require('./models/User');
const MatchModel = require('./models/Match');
const BetModel = require('./models/Bet');
const CardModel = require('./models/Card');
const CardOwnershipHistoryModel = require('./models/CardOwnershipHistory');
const ItemModel = require('./models/Item');
const InventoryItemModel = require('./models/InventoryItem');
const AuctionModel = require('./models/Auction');
const BidModel = require('./models/Bid');
const SportModel = require('./models/Sport');
const LeagueModel = require('./models/League')

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: config.DB_DIALECT,
    logging: false,
});

// Initialize models
const User = UserModel(sequelize);
const Match = MatchModel(sequelize);
const Bet = BetModel(sequelize);
const Card = CardModel(sequelize);
const CardOwnershipHistory = CardOwnershipHistoryModel(sequelize);
const Item = ItemModel(sequelize);
const InventoryItem = InventoryItemModel(sequelize);
const Auction = AuctionModel(sequelize);
const Bid = BidModel(sequelize);
const Sport = SportModel(sequelize);
const League = LeagueModel(sequelize);

// Setup associations with explicit foreign key options
User.hasMany(Bet, {
    foreignKey: { name: 'userId', allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Bet.belongsTo(User, {
    foreignKey: { name: 'userId', allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Match.hasMany(Bet, {
    foreignKey: { name: 'matchId', allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Bet.belongsTo(Match, {
    foreignKey: { name: 'matchId', allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Card.belongsTo(User, {
    foreignKey: { name: 'userId', allowNull: false },
    onDelete: 'CASCADE'
});

User.hasMany(Card, {
    foreignKey: { name: 'userId', allowNull: false }
});

CardOwnershipHistory.belongsTo(Card, {
    foreignKey: { allowNull: false }
});

Card.hasMany(CardOwnershipHistory);

CardOwnershipHistory.belongsTo(User, {
    as: 'fromUser',
    foreignKey: 'fromUserId'
});

CardOwnershipHistory.belongsTo(User, {
    as: 'toUser',
    foreignKey: 'toUserId'
});

Card.hasMany(Bet, {
    foreignKey: 'cardId'
});

Bet.belongsTo(Card, {
    foreignKey: 'cardId'
});

User.hasMany(InventoryItem, {
    foreignKey: 'UserTelegramId',
    sourceKey: 'telegramId'
});
InventoryItem.belongsTo(User, {
    foreignKey: 'UserTelegramId',
    targetKey: 'telegramId'
});

InventoryItem.belongsTo(Item,
    { foreignKey: 'ItemId' }
);

Item.hasMany(InventoryItem, { foreignKey: 'ItemId' });

// Auction and Bids
Auction.belongsTo(Card, {
    foreignKey: { allowNull: false }
});

Card.hasOne(Auction);

Auction.hasMany(Bid);
Bid.belongsTo(Auction);

Bid.belongsTo(User, {
    foreignKey: { allowNull: false }
});

User.hasMany(Bid);

// Test DB connection
async function connectToDB() {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

// Sync models
async function syncModels() {
    try {
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error syncing models:', error);
        process.exit(1);
    }
}

module.exports = {
    sequelize,
    connectToDB,
    syncModels,
    models: {
        User,
        Match,
        Bet,
        Card,
        CardOwnershipHistory,
        Item,
        InventoryItem,
        Auction,
        Bid,
        Sport,
        League,
    },
};
