const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Central source of truth for prices. Tickets always look up the price
// here at booking time rather than trusting a price sent by the client -
// this is what prevents "incorrect pricing" / client-side tampering.
const Pricing = sequelize.define('Pricing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  passType: {
    type: DataTypes.ENUM('single_ride', 'day_pass', 'weekly_pass', 'monthly_pass'),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  // Optional: route-specific pricing. Null = applies to all routes.
  busId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'pricing',
  timestamps: true,
});

module.exports = Pricing;
