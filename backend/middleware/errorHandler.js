/**
 * Centralized error handler middleware.
 * Must be registered last in Express app.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Max 10MB.' });
  }

  if (err.message?.includes('Unsupported file type')) {
    return res.status(415).json({ error: err.message });
  }

  // Generic
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
