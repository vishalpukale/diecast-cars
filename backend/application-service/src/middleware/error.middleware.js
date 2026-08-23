const { logger } = require('../utils/logger.utils');

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);

  let { status, message, data } = error;
  status = Number.isInteger(status) && status >= 100 && status < 600 ? status : 500;

  const isHttpException = error?.name === 'HttpException';
  message =
    status === 500 && !isHttpException
      ? 'Internal server error'
      : message || 'Something went wrong';

  logger.error(`${req.method} ${req.originalUrl} ${status} - ${message}`);

  res.status(status).json({
    type: 'error',
    status,
    message,
    data: data || null,
  });
}

module.exports = errorMiddleware;
