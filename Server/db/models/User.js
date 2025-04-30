const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    telegramId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    coins: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1000 // Starting coins
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gamesPlayed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    cardsOwned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    betsPlaced: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ranking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    // Adds your daily reward tracking fields
    lastClaimedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    rewardDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 // 0 means no reward claimed yet
    }
  }, {
    timestamps: true // ✅ Adds createdAt and updatedAt automatically (recommended)
  });

  return User;
};
