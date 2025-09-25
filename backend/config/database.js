const path = require('path');

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../database/database.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../database/migrations')
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 2,
      max: 20
    },
    migrations: {
      directory: path.join(__dirname, '../database/migrations')
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];