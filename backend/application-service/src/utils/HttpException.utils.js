class HttpException extends Error {
  constructor(status = 500, message = 'Something went wrong', data = {}) {
    super(message);
    this.name = 'HttpException';
    this.status = status;
    this.data = typeof data === 'object' ? data : { message: data };
    Error.captureStackTrace(this, this.constructor);
  }

  static from(err, fallbackStatus = 500, fallbackMessage = 'Request failed') {
    if (err instanceof HttpException) return err;
    const status =
      Number.isInteger(err?.status) && err.status >= 400 && err.status < 600
        ? err.status
        : fallbackStatus;
    return new HttpException(status, err?.message || fallbackMessage);
  }
}

module.exports = HttpException;
