const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes that require a signed-in user.
// Expects the header: Authorization: Bearer <token>
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // The password is excluded automatically by the schema's `select: false`.
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user for this token no longer exists.',
      });
    }

    // Make the authenticated user available to downstream handlers.
    req.user = user;

    return next();
  } catch (error) {
    // Covers malformed tokens, expired tokens and a missing JWT_SECRET.
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = { protect };
