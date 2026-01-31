export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal server error'
  };
  if (err.details) {
    payload.details = err.details;
  }
  // Avoid leaking stack traces in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
  next();
}
