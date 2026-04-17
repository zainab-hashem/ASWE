const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  checkpoint_id: {
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  incident_type: {
    type: DataTypes.ENUM('closure', 'delay', 'accident', 'weather_hazard', 'other'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'verified', 'closed'),
    defaultValue: 'open'
  },
  area: {
    type: DataTypes.STRING
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7)
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7)
  },
  created_by: {
    type: DataTypes.INTEGER
  },
  verified_by: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'incidents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Incident;
