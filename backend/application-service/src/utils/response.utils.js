const success = (res, data = null, message = 'Success', status = 200) => {
  return res.status(status).json({
    type: 'success',
    status,
    message,
    data,
  });
};

module.exports = { success };
