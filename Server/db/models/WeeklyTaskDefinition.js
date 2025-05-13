// db/models/WeeklyTaskDefinition.js
module.exports = (sequelize, DataTypes) => {
    const WeeklyTaskDefinition = sequelize.define('WeeklyTaskDefinition', {
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      criteria: {
        type: DataTypes.JSON,
        allowNull: false
      },
      rewardType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rewardValue: {
        type: DataTypes.JSON,
        allowNull: false
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    }, {
      tableName: 'WeeklyTaskDefinitions',
      timestamps: true
    });
  
    WeeklyTaskDefinition.associate = (models) => {
      WeeklyTaskDefinition.hasMany(models.UserWeeklyTask, {
        foreignKey: 'definitionId',
        as: 'userTasks'
      });
    };
  
    return WeeklyTaskDefinition;
  };
  