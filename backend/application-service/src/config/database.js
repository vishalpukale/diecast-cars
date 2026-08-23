const path = require('path');
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { logger } = require('../utils/logger.utils');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX || 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
};

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  logger.error('Unexpected idle client error', { error: err.message, code: err.code });
});

const db = drizzle(pool, {
  logger: process.env.DB_LOGGING === 'true',
});

const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('Database connected successfully');
    return true;
  } finally {
    client.release();
  }
};

const runMigrations = async () => {
  const migrationsFolder = path.join(__dirname, '../db/migrations');
  await migrate(db, { migrationsFolder });
  logger.info('Database migrations completed');
};

const initializeDatabase = async () => {
  const ok = await testConnection();
  if (!ok) throw new Error('Database connection failed');
  await runMigrations();
};

const closeConnection = async () => {
  await pool.end();
  logger.info('Database connection closed');
};

module.exports = {
  db,
  pool,
  initializeDatabase,
  testConnection,
  closeConnection,
};
