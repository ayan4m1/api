module.exports = (sequelize, DataTypes) => {
  const UsersPreferences = sequelize.define(
    'UsersPreferences',
    {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: {
          model: sequelize.User,
          key: 'id'
        }
      },
      preferenceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: sequelize.Preference,
          key: 'id'
        }
      },
      value: {
        type: DataTypes.STRING,
        allowNull: true
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      underscored: true,
      tableName: 'users_preferences',
      createdAt: 'created',
      updatedAt: false
    }
  );

  UsersPreferences.associate = function(models) {
    this.belongsTo(models.User, { foreignKey: 'UserId' });
    this.belongsTo(models.UserProfile, { foreignKey: 'userId' });
    this.hasOne(models.Preference, {
      foreignKey: 'id',
      sourceKey: 'preferenceId'
    });
  };

  return UsersPreferences;
};
