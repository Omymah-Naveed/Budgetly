const mongoose = require('mongoose');
const {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
} = require('../config/currencies');

// Shape of a user document stored in MongoDB.
// `select: false` keeps the password hash out of query results by default.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    currency: {
      type: String,
      enum: {
        values: SUPPORTED_CURRENCIES,
        message: 'Unsupported currency.',
      },
      uppercase: true,
      trim: true,
      default: DEFAULT_CURRENCY,
    },
    resetPasswordToken: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    // Adds createdAt / updatedAt timestamps automatically.
    timestamps: true,
  },
);

module.exports = mongoose.model('User', userSchema);
