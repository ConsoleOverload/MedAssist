import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error at ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: messages,
      meta: { requestId: req.requestId },
    });
  }

  // MongoDB Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, `A record with this ${field} already exists.`, 409, { requestId: req.requestId });
  }

  // MongoDB CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ID format for ${err.path}`, 400, { requestId: req.requestId });
  }

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = statusCode === 500 ? 'An unexpected server error occurred.' : err.message;

  return sendError(res, message, statusCode, { requestId: req.requestId });
};
