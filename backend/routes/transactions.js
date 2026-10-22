const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Every route below requires a valid JWT and scopes data to req.user.
router.use(protect);

const VALID_TYPES = ['income', 'expense'];

const toPublicTransaction = (transaction) => ({
  id: transaction._id.toString(),
  userId: transaction.userId.toString(),
  title: transaction.title,
  amount: transaction.amount,
  type: transaction.type,
  category: transaction.category,
  date: transaction.date,
  description: transaction.description ?? '',
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
});

// Shared validation for create and update so both routes behave the same.
const parseTransactionInput = (body = {}) => {
  const { title, amount, type, category, date, description } = body;

  const titleValue = typeof title === 'string' ? title.trim() : '';
  const categoryValue = typeof category === 'string' ? category.trim() : '';
  const typeValue = typeof type === 'string' ? type.trim().toLowerCase() : '';
  const amountValue = Number(amount);

  if (
    !titleValue ||
    !categoryValue ||
    !typeValue ||
    amount === undefined ||
    amount === null ||
    amount === ''
  ) {
    return { error: 'Title, amount, type and category are required.' };
  }

  if (!VALID_TYPES.includes(typeValue)) {
    return { error: 'Type must be either income or expense.' };
  }

  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    return { error: 'Amount must be a positive number.' };
  }

  // Only override the schema default when a date was actually provided.
  let dateValue;
  if (date !== undefined && date !== null && date !== '') {
    dateValue = new Date(date);

    if (Number.isNaN(dateValue.getTime())) {
      return { error: 'Date must be a valid date.' };
    }
  }

  return {
    values: {
      title: titleValue,
      amount: amountValue,
      type: typeValue,
      category: categoryValue,
      ...(dateValue ? { date: dateValue } : {}),
      ...(typeof description === 'string'
        ? { description: description.trim() }
        : {}),
    },
  };
};

const sendServerError = (res, action, error) => {
  console.error(`${action} transaction error:`, error);

  return res.status(500).json({
    success: false,
    message: `Something went wrong while ${action.toLowerCase()} the transaction.`,
  });
};

// POST /api/transactions - create a transaction for the signed-in user.
router.post('/', async (req, res) => {
  try {
    const { error, values } = parseTransactionInput(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      ...values,
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      transaction: toPublicTransaction(transaction),
    });
  } catch (error) {
    // Mongoose schema validation (for example a bad enum value).
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(
        (validationError) => validationError.message,
      );

      return res.status(400).json({
        success: false,
        message: messages[0] || 'Invalid transaction data.',
        errors: messages,
      });
    }

    return sendServerError(res, 'Creating', error);
  }
});

// GET /api/transactions - list only the signed-in user's transactions.
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions: transactions.map(toPublicTransaction),
    });
  } catch (error) {
    return sendServerError(res, 'Fetching', error);
  }
});

// PUT /api/transactions/:id - update one of the signed-in user's transactions.
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction id.',
      });
    }

    const { error, values } = parseTransactionInput(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // Matching on userId prevents updating another user's transaction.
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    Object.assign(transaction, values);
    await transaction.save();

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction: toPublicTransaction(transaction),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(
        (validationError) => validationError.message,
      );

      return res.status(400).json({
        success: false,
        message: messages[0] || 'Invalid transaction data.',
        errors: messages,
      });
    }

    return sendServerError(res, 'Updating', error);
  }
});

// DELETE /api/transactions/:id - delete one of the signed-in user's transactions.
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction id.',
      });
    }

    // Matching on userId prevents deleting another user's transaction.
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
      id,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction id.',
      });
    }

    return sendServerError(res, 'Deleting', error);
  }
});

module.exports = router;
