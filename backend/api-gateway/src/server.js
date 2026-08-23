require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const proxy = require('express-http-proxy');

const app = express();
const port = Number(process.env.PORT || 3330);
const applicationServiceUrl =
  process.env.APPLICATION_SERVICE_URL || 'http://localhost:3334';

app.set('trust proxy', false);
app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({
    type: 'success',
    status: 200,
    message: 'api-gateway healthy',
    data: { service: 'api-gateway', time: new Date().toISOString() },
  });
});

app.use(
  '/uploads',
  proxy(applicationServiceUrl, {
    proxyReqPathResolver: (req) => `/uploads${req.url}`,
    timeout: 60000,
    proxyErrorHandler: (err, res, next) => {
      console.error('[gateway] uploads proxy error', err.message);
      if (!res.headersSent) {
        res.status(502).json({
          type: 'error',
          status: 502,
          message: 'Upload service unavailable',
          data: null,
        });
      } else {
        next(err);
      }
    },
  })
);

app.use(
  '/api',
  proxy(applicationServiceUrl, {
    proxyReqPathResolver: (req) => `/api${req.url}`,
    limit: '15mb',
    parseReqBody: false,
    timeout: 60000,
    proxyErrorHandler: (err, res, next) => {
      console.error('[gateway] proxy error', err.message);
      if (!res.headersSent) {
        res.status(502).json({
          type: 'error',
          status: 502,
          message: 'Upstream service unavailable',
          data: null,
        });
      } else {
        next(err);
      }
    },
  })
);

app.all('*', (req, res) => {
  res.status(404).json({
    type: 'error',
    status: 404,
    message: `Can't find ${req.originalUrl}`,
    data: null,
  });
});

app.listen(port, () => {
  console.log(`api-gateway listening on port ${port}`);
  console.log(`proxying /api -> ${applicationServiceUrl}/api`);
});
