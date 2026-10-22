const Budget = require('../models/Budget');

// Default monthly limits created for every new account.
const DEFAULT_BUDGETS = [
  { category: 'Food', limit: 600 },
  { category: 'Rent', limit: 1800 },
  { category: 'Utilities', limit: 250 },
  { category: 'Shopping', limit: 700 },
  { category: 'Entertainment', limit: 150 },
];

const BUDGET_CATEGORIES = DEFAULT_BUDGETS.map((budget) => budget.category);

const getCurrentPeriod = () => {
  const now = new Date();

  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

const normalizePeriod = ({ year, month } = {}) => {
  const current = getCurrentPeriod();
  const yearValue = year === undefined ? current.year : Number(year);
  const monthValue = month === undefined ? current.month : Number(month);

  if (
    !Number.isInteger(yearValue) ||
    yearValue < 2000 ||
    yearValue > 2100 ||
    !Number.isInteger(monthValue) ||
    monthValue < 1 ||
    monthValue > 12
  ) {
    const error = new Error('A valid year and month are required.');
    error.status = 400;
    throw error;
  }

  return { year: yearValue, month: monthValue };
};

const insertBudgets = async (documents) => {
  try {
    await Budget.insertMany(documents, { ordered: false });
  } catch (error) {
    // Two simultaneous requests can both try to seed. The unique index
    // rejects the loser; that is safe to ignore.
    const isDuplicateOnly =
      error?.code === 11000 ||
      (Array.isArray(error?.writeErrors) &&
        error.writeErrors.every((writeError) => writeError.code === 11000));

    if (!isDuplicateOnly) throw error;
  }
};

// Seeds a period from the most recent earlier period. This keeps the old
// budget plan going when a new month starts without touching past history.
const ensureBudgetsForPeriod = async (userId, periodInput) => {
  const { year, month } = normalizePeriod(periodInput);

  const existingCount = await Budget.countDocuments({ userId, year, month });
  if (existingCount > 0) return { year, month };

  const latest = await Budget.findOne({
    userId,
    $or: [
      { year: { $lt: year } },
      { year, month: { $lt: month } },
    ],
  }).sort({ year: -1, month: -1 });

  let source = DEFAULT_BUDGETS;

  if (latest) {
    const previous = await Budget.find({
      userId,
      year: latest.year,
      month: latest.month,
    });

    if (previous.length > 0) {
      source = previous.map(({ category, limit }) => ({ category, limit }));
    }
  }

  await insertBudgets(
    source.map((budget) => ({
      userId,
      year,
      month,
      category: budget.category,
      limit: budget.limit,
    })),
  );

  return { year, month };
};

// Backward-compatible name used when an account is created.
const ensureDefaultBudgets = (userId) =>
  ensureBudgetsForPeriod(userId, getCurrentPeriod());

const migrateBudgets = async () => {
  // Older deployments used a unique user/category index. Drop it before
  // assigning periods so more than one month can exist per category.
  const indexes = await Budget.collection.indexes().catch(() => []);
  const legacyIndex = indexes.find(
    (index) => index.key?.userId === 1 && index.key?.category === 1,
  );

  if (legacyIndex) {
    await Budget.collection.dropIndex(legacyIndex.name);
  }

  const current = getCurrentPeriod();

  await Budget.updateMany(
    {
      $or: [
        { year: { $exists: false } },
        { year: null },
        { month: { $exists: false } },
        { month: null },
      ],
    },
    { $set: { year: current.year, month: current.month } },
  );

  await Budget.syncIndexes();
};

module.exports = {
  BUDGET_CATEGORIES,
  DEFAULT_BUDGETS,
  ensureDefaultBudgets,
  ensureBudgetsForPeriod,
  getCurrentPeriod,
  migrateBudgets,
  normalizePeriod,
};
