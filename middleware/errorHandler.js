const ApiResponse = require('../utils/ApiResponse');

/**
 * Global Error Handler Middleware
 * Provides consistent error responses and logging
 */

/**
 * Development error response - includes stack trace
 */
const sendErrorDev = (err, res) => {
  console.error('💥 ERROR:', {
    message: err.message,
    stack: err.stack,
    error: err
  });

  const response = ApiResponse.error(
    err.message,
    {
      name: err.name,
      stack: err.stack,
      ...err
    },
    err.statusCode || 500
  );

  res.status(response.statusCode).json(response);
};

/**
 * Production error response - user-friendly messages only
 */
const sendErrorProd = (err, res) => {
  // Log error for monitoring
  console.error('💥 ERROR:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  // Operational errors - send to client
  if (err.isOperational) {
    const response = ApiResponse.error(
      err.message,
      null,
      err.statusCode || 500
    );
    return res.status(response.statusCode).json(response);
  }

  // Programming errors - don't leak details
  const response = ApiResponse.error(
    'Something went wrong!',
    null,
    500
  );
  res.status(500).json(response);
};

/**
 * Handle MongoDB Cast Error (invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new Error(message);
  error.statusCode = 400;
  error.isOperational = true;
  return error;
};

/**
 * Handle MongoDB Duplicate Key Error
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  const error = new Error(message);
  error.statusCode = 400;
  error.isOperational = true;
  return error;
};

/**
 * Handle MongoDB Validation Error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  const error = new Error(message);
  error.statusCode = 400;
  error.isOperational = true;
  return error;
};

/**
 * Handle JWT Invalid Token Error
 */
const handleJWTError = () => {
  const error = new Error('Invalid token. Please log in again!');
  error.statusCode = 401;
  error.isOperational = true;
  return error;
};

/**
 * Handle JWT Expired Token Error
 */
const handleJWTExpiredError = () => {
  const error = new Error('Your token has expired! Please log in again.');
  error.statusCode = 401;
  error.isOperational = true;
  return error;
};

/**
 * Handle Multer File Upload Errors
 */
const handleMulterError = (err) => {
  let message = 'File upload error';
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File too large. Please upload a smaller file.';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files. Please reduce the number of files.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field. Please check your form.';
  }
  
  const error = new Error(message);
  error.statusCode = 400;
  error.isOperational = true;
  return error;
};

/**
 * Main error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log request info for debugging
  console.error('🔥 Error occurred:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'MulterError') error = handleMulterError(error);

    sendErrorProd(error, res);
  }
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  const response = ApiResponse.notFound(message);
  res.status(404).json(response);
};

/**
 * Async error wrapper
 * Wraps async functions to automatically catch errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  catchAsync,
  AppError
}; 