module.exports = (sequelize, DataTypes) => {
  const Preference = sequelize.define(
    'Preference',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'preference',
      createdAt: 'created',
      updatedAt: false
    }
  );

  Preference.associate = function(models) {
    this.hasMany(models.UsersPreferences, {
      foreignKey: 'preference_id'
    });
  };

  return Preference;
};
