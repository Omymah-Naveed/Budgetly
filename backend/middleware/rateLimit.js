const { rateLimit } = require('express-rate-limit');

const jsonLimitHandler = (message) => (req, res) => {
  res.status(429).json({ success: false, message });
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: jsonLimitHandler(
    'Too many authentication attempts. Please wait 15 minutes and try again.',
  ),
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: jsonLimitHandler(
    'Too many password reset requests. Please wait 15 minutes and try again.',
  ),
});

module.exports = { authLimiter, passwordResetLimiter };
