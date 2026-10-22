const mongoose = require('mongoose');

// One monthly limit per category for each user and period.
const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Budget year is required'],
      min: [2000, 'Budget year is invalid'],
      max: [2100, 'Budget year is invalid'],
    },
    month: {
      type: Number,
      required: [true, 'Budget month is required'],
      min: [1, 'Budget month is invalid'],
      max: [12, 'Budget month is invalid'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0.01, 'Budget limit must be greater than zero'],
    },
  },
  {
    timestamps: true,
  },
);

// A user can only have one budget per category in a given month.
budgetSchema.index(
  { userId: 1, year: 1, month: 1, category: 1 },
  { unique: true },
);

module.exports = mongoose.model('Budget', budgetSchema);
