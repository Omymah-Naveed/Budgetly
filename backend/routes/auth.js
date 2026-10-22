const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');
const {
  authLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimit');
const {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
} = require('../config/currencies');
const { ensureDefaultBudgets } = require('../services/budgetService');
const { sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();

// bcrypt cost factor. 10 is a good balance between security and speed.
const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = '7d';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fail loudly at request time if the secret was not configured in .env.
const getJwtSecret = () => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return JWT_SECRET;
};

const signToken = (userId) =>
  jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: TOKEN_EXPIRES_IN });

// Only expose safe fields to the client. The password hash must never be sent.
const toPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  currency: user.currency || DEFAULT_CURRENCY,
  createdAt: user.createdAt || null,
});

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const getClientUrl = () =>
  (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    const nameValue = typeof name === 'string' ? name.trim() : '';
    const emailValue = normalizeEmail(email);
    const passwordValue = typeof password === 'string' ? password : '';

    // Basic input validation before touching the database.
    if (!nameValue || !emailValue || !passwordValue) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.',
      });
    }

    if (!EMAIL_PATTERN.test(emailValue)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.',
      });
    }

    if (passwordValue.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Reject duplicate accounts with a clear 409 response.
    const existingUser = await User.findOne({ email: emailValue });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Hash the password with a per-user salt before saving it.
    const hashedPassword = await bcrypt.hash(passwordValue, SALT_ROUNDS);

    const user = await User.create({
      name: nameValue,
      email: emailValue,
      password: hashedPassword,
    });

    // Give every new account the default monthly budget plan. Seeding is
    // best-effort so a failure cannot block account creation.
    try {
      await ensureDefaultBudgets(user._id);
    } catch (seedError) {
      console.error('Default budget seed error:', seedError);
    }

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    // MongoDB's duplicate-key error (e.g. two simultaneous registrations).
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    console.error('Register error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating your account.',
    });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    const emailValue = normalizeEmail(email);
    const passwordValue = typeof password === 'string' ? password : '';

    if (!emailValue || !passwordValue) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // `select('+password')` is required because the schema hides it by default.
    const user = await User.findOne({ email: emailValue }).select('+password');

    // Use the same generic message for unknown users and wrong passwords so
    // the response does not reveal whether an email is registered.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      passwordValue,
      user.password,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while signing you in.',
    });
  }
});

// POST /api/auth/forgot-password - send a reset link when the account exists.
// The response is always generic to avoid revealing registered emails.
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  const genericResponse = {
    success: true,
    message:
      'If an account exists for that email, a password reset link has been sent.',
  };

  try {
    const emailValue = normalizeEmail(req.body?.email);

    if (!EMAIL_PATTERN.test(emailValue)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.',
      });
    }

    const user = await User.findOne({ email: emailValue });

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = hashResetToken(rawToken);
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const resetUrl = `${getClientUrl().replace(/\/$/, '')}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (emailError) {
      // Never turn an email delivery failure into account enumeration.
      console.error('Password reset email error:', emailError);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while preparing your reset link.',
    });
  }
});

// POST /api/auth/reset-password/:token - choose a new password.
router.post('/reset-password/:token', passwordResetLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!/^[a-f0-9]{64}$/i.test(token || '')) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link is invalid or has expired.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link is invalid or has expired.',
      });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while resetting your password.',
    });
  }
});

// GET /api/auth/me - return the signed-in user's profile.
router.get('/me', protect, (req, res) =>
  res.status(200).json({
    success: true,
    user: toPublicUser(req.user),
  }),
);

// PUT /api/auth/profile - update name, email and currency.
// Changing the email requires the current password.
router.put('/profile', protect, async (req, res) => {
  try {
    const { currentPassword } = req.body ?? {};

    const nameValue =
      req.body?.name === undefined
        ? req.user.name
        : typeof req.body.name === 'string'
          ? req.body.name.trim()
          : '';
    const emailValue =
      req.body?.email === undefined
        ? req.user.email
        : normalizeEmail(req.body.email);
    const currencyValue =
      req.body?.currency === undefined
        ? req.user.currency || DEFAULT_CURRENCY
        : typeof req.body.currency === 'string'
          ? req.body.currency.trim().toUpperCase()
          : '';

    if (!nameValue) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!EMAIL_PATTERN.test(emailValue)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.',
      });
    }

    if (!SUPPORTED_CURRENCIES.includes(currencyValue)) {
      return res.status(400).json({
        success: false,
        message: 'Choose a supported currency.',
      });
    }

    const emailChanged = emailValue !== req.user.email;

    if (emailChanged) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Enter your current password to change your email.',
        });
      }

      const userWithPassword = await User.findById(req.user._id).select(
        '+password',
      );

      const passwordMatches = await bcrypt.compare(
        String(currentPassword),
        userWithPassword?.password || '',
      );

      if (!passwordMatches) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.',
        });
      }
    }

    const duplicate = await User.findOne({
      email: emailValue,
      _id: { $ne: req.user._id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    req.user.name = nameValue;
    req.user.email = emailValue;
    req.user.currency = currencyValue;

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: toPublicUser(req.user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message:
          Object.values(error.errors)[0]?.message ||
          'Invalid profile details.',
      });
    }

    console.error('Update profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating your profile.',
    });
  }
});

// PUT /api/auth/password - change the password after verifying the current one.
router.put('/password', protect, async (req, res) => {
  try {
    const currentPassword =
      typeof req.body?.currentPassword === 'string'
        ? req.body.currentPassword
        : '';
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user for this token no longer exists.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the current password.',
      });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Update password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating your password.',
    });
  }
});

// DELETE /api/auth/account - permanently remove the account and its data.
router.delete('/account', protect, async (req, res) => {
  try {
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';
    const confirmation = req.body?.confirmation;

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Type DELETE to confirm account removal.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Enter your current password to delete your account.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user for this token no longer exists.',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Delete owned data first, then the account itself.
    await Promise.all([
      Transaction.deleteMany({ userId: user._id }),
      Budget.deleteMany({ userId: user._id }),
    ]);
    await User.deleteOne({ _id: user._id });

    return res.status(200).json({
      success: true,
      message: 'Your account and all associated data have been deleted.',
    });
  } catch (error) {
    console.error('Delete account error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting your account.',
    });
  }
});

module.exports = router;
