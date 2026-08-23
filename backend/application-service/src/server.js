require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const HttpException = require('./utils/HttpException.utils');
const errorMiddleware = require('./middleware/error.middleware');
const { logger, dev, combined } = require('./utils/logger.utils');
const { initializeDatabase, closeConnection } = require('./config/database');
const routes = require('./routes');

const app = express();
const port = Number(process.env.PORT || 3334);

app.set('trust proxy', false);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors());
app.options('*', cors());
app.use(dev);
app.use(combined);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.all('*', (req, res, next) => {
  next(new HttpException(404, `Can't find ${req.originalUrl}`));
});

app.use(errorMiddleware);

const start = async () => {
  await initializeDatabase();
  const server = app.listen(port, () => {
    logger.info(`application-service listening on port ${port}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      await closeConnection();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((err) => {
  console.error('Failed to start application-service', err);
  process.exit(1);
});
