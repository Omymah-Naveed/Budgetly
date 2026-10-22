const express = require('express');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');
const {
  BUDGET_CATEGORIES,
  ensureBudgetsForPeriod,
  normalizePeriod,
} = require('../services/budgetService');

const router = express.Router();

// Budgets are always scoped to the signed-in user.
router.use(protect);

const toPublicBudget = (budget) => ({
  id: budget._id.toString(),
  year: budget.year,
  month: budget.month,
  category: budget.category,
  limit: budget.limit,
});

const sortBudgets = (budgets) =>
  [...budgets].sort(
    (a, b) =>
      BUDGET_CATEGORIES.indexOf(a.category) -
      BUDGET_CATEGORIES.indexOf(b.category),
  );

const resolvePeriod = (req, res) => {
  try {
    return normalizePeriod({
      year: req.query.year,
      month: req.query.month,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
    return null;
  }
};

const getPeriodBudgets = async (userId, period) => {
  await ensureBudgetsForPeriod(userId, period);

  return Budget.find({ userId, year: period.year, month: period.month });
};

// GET /api/budgets?year=2026&month=10 - list a period's category budgets.
router.get('/', async (req, res) => {
  const period = resolvePeriod(req, res);
  if (!period) return undefined;

  try {
    const budgets = await getPeriodBudgets(req.user._id, period);
    const totalLimit =
      Math.round(
        budgets.reduce((total, budget) => total + budget.limit, 0) * 100,
      ) / 100;

    return res.status(200).json({
      success: true,
      count: budgets.length,
      period,
      totalLimit,
      budgets: sortBudgets(budgets).map(toPublicBudget),
    });
  } catch (error) {
    console.error('Fetch budgets error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching budgets.',
    });
  }
});

// PUT /api/budgets?year=2026&month=10 - update the overall monthly limit by
// scaling every category envelope proportionally.
router.put('/', async (req, res) => {
  const period = resolvePeriod(req, res);
  if (!period) return undefined;

  try {
    const requestedLimit = Number(req.body?.limit);

    if (!Number.isFinite(requestedLimit) || requestedLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monthly budget limit must be a number greater than zero.',
      });
    }

    const totalCents = Math.round(requestedLimit * 100);
    const budgets = await getPeriodBudgets(req.user._id, period);

    if (budgets.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No category budgets are available to update.',
      });
    }

    if (totalCents < budgets.length) {
      return res.status(400).json({
        success: false,
        message: `Monthly budget limit must be at least ${(budgets.length / 100).toFixed(2)} to spread across ${budgets.length} categories.`,
      });
    }

    const currentCents = budgets.reduce(
      (total, budget) => total + Math.round(budget.limit * 100),
      0,
    );

    const allocatedCents = budgets.map((budget) => {
      if (currentCents <= 0) {
        return Math.floor(totalCents / budgets.length);
      }

      return Math.round(
        (Math.round(budget.limit * 100) / currentCents) * totalCents,
      );
    });

    // Scale evenly when every existing limit is zero.
    if (currentCents <= 0) {
      const baseShare = Math.floor(totalCents / budgets.length);
      const remainder = totalCents - baseShare * budgets.length;

      for (let index = 0; index < allocatedCents.length; index += 1) {
        allocatedCents[index] = baseShare + (index < remainder ? 1 : 0);
      }
    }

    if (allocatedCents.some((cents) => cents < 1)) {
      return res.status(400).json({
        success: false,
        message:
          'Monthly budget limit is too low to give every category a positive limit.',
      });
    }

    // Rounding can leave a few cents unassigned. Put them on the largest
    // category so the sum matches the requested total exactly.
    const assignedCents = allocatedCents.reduce(
      (total, cents) => total + cents,
      0,
    );
    const difference = totalCents - assignedCents;

    if (difference !== 0) {
      let largestIndex = 0;

      for (let index = 1; index < allocatedCents.length; index += 1) {
        if (allocatedCents[index] > allocatedCents[largestIndex]) {
          largestIndex = index;
        }
      }

      allocatedCents[largestIndex] += difference;
    }

    if (allocatedCents.some((cents) => cents < 1)) {
      return res.status(400).json({
        success: false,
        message:
          'Monthly budget limit is too low to give every category a positive limit.',
      });
    }

    await Budget.bulkWrite(
      budgets.map((budget, index) => ({
        updateOne: {
          filter: { _id: budget._id },
          update: { $set: { limit: allocatedCents[index] / 100 } },
        },
      })),
    );

    const updatedBudgets = await Budget.find({
      userId: req.user._id,
      year: period.year,
      month: period.month,
    });
    const totalLimit =
      allocatedCents.reduce((total, cents) => total + cents, 0) / 100;

    return res.status(200).json({
      success: true,
      message: 'Monthly budget limit updated successfully.',
      period,
      totalLimit,
      budgets: sortBudgets(updatedBudgets).map(toPublicBudget),
    });
  } catch (error) {
    console.error('Update total budget limit error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating the monthly budget limit.',
    });
  }
});

// PUT /api/budgets/:category?year=2026&month=10 - update one category limit.
router.put('/:category', async (req, res) => {
  const period = resolvePeriod(req, res);
  if (!period) return undefined;

  try {
    const requestedCategory =
      typeof req.params.category === 'string'
        ? req.params.category.trim()
        : '';

    // Match case-insensitively but store the canonical category name.
    const category = BUDGET_CATEGORIES.find(
      (knownCategory) =>
        knownCategory.toLowerCase() === requestedCategory.toLowerCase(),
    );

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Unknown budget category.',
      });
    }

    const limit = Number(req.body?.limit);

    if (!Number.isFinite(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget limit must be a number greater than zero.',
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, ...period, category },
      { $set: { limit: Math.round(limit * 100) / 100 } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: 'Budget limit updated successfully.',
      period,
      budget: toPublicBudget(budget),
    });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message:
          Object.values(error.errors)[0]?.message ||
          'Invalid budget data.',
      });
    }

    console.error('Update budget error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating the budget.',
    });
  }
});

module.exports = router;
