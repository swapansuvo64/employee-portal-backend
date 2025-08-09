const mysql = require('mysql2/promise');
require('dotenv').config();

const authPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.AUTH_DB_NAME,
  timezone: process.env.DB_TIMEZONE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = authPool;