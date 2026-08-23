const HttpException = require('../utils/HttpException.utils');

const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  const expected = process.env.ADMIN_API_KEY;

  if (!expected || key !== expected) {
    return next(new HttpException(401, 'Unauthorized admin access'));
  }

  next();
};

module.exports = adminAuth;
