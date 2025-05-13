// db/models/UserWeeklyTask.js
module.exports = (sequelize, DataTypes) => {
    const UserWeeklyTask = sequelize.define('UserWeeklyTask', {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      definitionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'WeeklyTaskDefinitions', key: 'id' }
      },
      weekStart: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      rewarded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      tableName: 'UserWeeklyTasks',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'definitionId', 'weekStart']
        }
      ]
    });
  
    UserWeeklyTask.associate = (models) => {
      UserWeeklyTask.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      UserWeeklyTask.belongsTo(models.WeeklyTaskDefinition, {
        foreignKey: 'definitionId',
        as: 'definition'
      });
    };
  
    return UserWeeklyTask;
  };
  