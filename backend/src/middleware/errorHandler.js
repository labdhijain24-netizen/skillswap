import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Error Handling Middleware
 * Catches unhandled errors and returns a formatted JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`, err.stack);

  let statusCode = err.statusCode;
  if (!statusCode) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('already') || msg.includes('duplicate') || msg.includes('conflict')) {
      statusCode = 409;
    } else if (msg.includes('not found')) {
      statusCode = 404;
    } else if (msg.includes('must be') || msg.includes('required') || msg.includes('invalid') || msg.includes('cannot')) {
      statusCode = 400;
    } else if (msg.includes('unauthorized')) {
      statusCode = 401;
    } else if (msg.includes('forbidden')) {
      statusCode = 403;
    } else {
      statusCode = 500;
    }
  }

  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode, err);
};

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
