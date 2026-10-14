export const sendSuccess = (
  res,
  data = null,
  message = 'Operation successful',
  statusCode = 200,
  meta = undefined
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const sendError = (
  res,
  error = 'An error occurred',
  statusCode = 400,
  meta = undefined
) => {
  return res.status(statusCode).json({
    success: false,
    error: typeof error === 'string' ? error : error.message || 'An error occurred',
    meta,
  });
};
