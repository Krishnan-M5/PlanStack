/**
 * Global Error Handler Middleware
 * Catches unhandled errors and returns a consistent JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Prisma known request errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: `A record with this ${err.meta?.target?.join(', ') || 'field'} already exists.`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'The requested record was not found.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
  });
};

module.exports = errorHandler;
