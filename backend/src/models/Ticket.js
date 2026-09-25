const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// A booked bus pass. The QR code encodes a signed token (see utils/qrcode.js)
// rather than raw ticket data, so a photographed/copied QR can't be
// re-used to forge a valid pass - the server always re-validates the
// signature and status on scan.
const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  busId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  passType: {
    type: DataTypes.ENUM('single_ride', 'day_pass', 'weekly_pass', 'monthly_pass'),
    allowNull: false,
  },
  priceCharged: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false, // snapshot of Pricing.price at booking time (audit trail)
  },
  qrToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true, // signed JWT embedded in the QR code
  },
  status: {
    type: DataTypes.ENUM('valid', 'used', 'expired', 'revoked'),
    defaultValue: 'valid',
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'tickets',
  timestamps: true,
});

module.exports = Ticket;
