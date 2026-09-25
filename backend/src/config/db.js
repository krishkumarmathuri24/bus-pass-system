// Sequelize connection setup.
// Works locally (SQLite or Docker/local Postgres) and on cloud platforms (Heroku/Railway)
// which inject a single DATABASE_URL instead of individual DB_* vars.
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Cloud deployment (Heroku/Railway) - single connection string
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // required by most free-tier hosts
      },
    },
    logging: false,
  });
} else if (process.env.DB_DIALECT === 'postgres') {
  // Explicitly configured local Postgres
  sequelize = new Sequelize(
    process.env.DB_NAME || 'bus_pass_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
} else {
  // Zero-configuration SQLite for local development (no external database server needed)
  const storagePath = process.env.DB_STORAGE 
    ? path.resolve(__dirname, '../../', process.env.DB_STORAGE) 
    : path.resolve(__dirname, '../../database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

module.exports = sequelize;

