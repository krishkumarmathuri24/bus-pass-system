const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// A bus/route the system can sell passes for and track.
const Bus = sequelize.define('Bus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  routeName: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "Route 42: Downtown - Airport"
  },
  busNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 40,
  },
  // Dummy live GPS position for the demo bus-tracker page.
  currentLat: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  currentLng: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('active', 'delayed', 'out_of_service'),
    defaultValue: 'active',
  },
}, {
  tableName: 'buses',
  timestamps: true,
});

module.exports = Bus;
