const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Checkpoint = sequelize.define('Checkpoint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7)
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7)
  },
  current_status: {
    type: DataTypes.ENUM('open', 'closed', 'delayed', 'hazard'),
    defaultValue: 'open'
  },
  created_by: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'checkpoints',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Checkpoint;
