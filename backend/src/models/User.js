const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// A registered user of the bus pass system.
// Passwords are always stored as bcrypt hashes, never plaintext.
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('rider', 'admin'),
    defaultValue: 'rider',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
