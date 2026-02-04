const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

const dbName = process.env.DB_NAME || 'farmarket';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbDriver = process.env.DB_DRIVER || 'postgres'; // 'postgres' or 'sqlite'

const log = (msg) => console.log(`[Database] ${msg}`);

// Force SQLite if specified or if driver is sqlite
if (dbDriver === 'sqlite' || process.env.USE_SQLITE === 'true') {
  log('Using SQLite database');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
} else {
  // PostgreSQL Configuration
  log(`Attempting to connect to PostgreSQL at ${dbHost}:${process.env.DB_PORT || 5432}`);
  log(`Database: ${dbName}, User: ${dbUser}`);

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Override authenticate to fallback if postgres fails? 
// That's complex/hacky. 
// Instead, we'll export a helper to switch mode if needed, but for now let's just use the env var approach
// OR, we can try to connect, and if it fails, return a sqlite instance?
// No, module exports are synchronous usually.

module.exports = sequelize;
