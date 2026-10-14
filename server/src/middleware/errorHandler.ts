import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  logger.error(`Unhandled error at ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors,
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
    return sendError(res, `Invalid identifier format for ${err.path}`, 400, { requestId: req.requestId });
  }

  // Known HTTP Status
  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const message = statusCode === 500 ? 'An unexpected server error occurred. Please try again later.' : err.message;

  return sendError(res, message, statusCode, { requestId: req.requestId });
};
