const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const metadataLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many metadata requests' } },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, metadataLimiter };
