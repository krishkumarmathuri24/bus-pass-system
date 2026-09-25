const sequelize = require('../config/db');
const User = require('./User');
const Bus = require('./Bus');
const Pricing = require('./Pricing');
const Ticket = require('./Ticket');

// Associations
User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.belongsTo(User, { foreignKey: 'userId' });

Bus.hasMany(Ticket, { foreignKey: 'busId' });
Ticket.belongsTo(Bus, { foreignKey: 'busId' });

Bus.hasMany(Pricing, { foreignKey: 'busId' });
Pricing.belongsTo(Bus, { foreignKey: 'busId' });

module.exports = { sequelize, User, Bus, Pricing, Ticket };
