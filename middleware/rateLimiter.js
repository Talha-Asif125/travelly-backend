const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/ApiResponse');

// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs (tripled from 100)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json(ApiResponse.error('Too many requests from this IP, please try again later.', null, 429));
  }
});

// Strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 60 requests per windowMs for auth routes (tripled from 20)
  message: {
    error: 'Too many authentication attempts, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(ApiResponse.error('Too many authentication attempts, please try again later.', null, 429));
  }
});

// Very strict rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 9, // limit each IP to 9 password reset requests per hour (tripled from 3)
  message: {
    error: 'Too many password reset attempts, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(ApiResponse.error('Too many password reset attempts, please try again later.', null, 429));
  }
});

// Registration rate limiter
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 9, // limit each IP to 9 registration attempts per hour (tripled from 3)
  message: {
    error: 'Too many registration attempts, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(ApiResponse.error('Too many registration attempts, please try again later.', null, 429));
  }
});

// Contact form rate limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 contact messages per 15 minutes (tripled from 5)
  message: {
    error: 'Too many contact form submissions, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(ApiResponse.error('Too many contact form submissions, please try again later.', null, 429));
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  contactLimiter
}; 