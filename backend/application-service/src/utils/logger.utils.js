const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');

const SERVICE_NAME = 'application-service';
const logDirectory = path.resolve(__dirname, '../../uploads/log');
fs.mkdirSync(logDirectory, { recursive: true });

const errorTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDirectory, `${SERVICE_NAME}_error-%DATE%.log`),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'error',
});

const combinedTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDirectory, `${SERVICE_NAME}_combined-%DATE%.log`),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: SERVICE_NAME },
  transports: [
    errorTransport,
    combinedTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${rest}`;
        })
      ),
    }),
  ],
});

module.exports = {
  logger,
  dev: morgan('dev'),
  combined: morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
};
