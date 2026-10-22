// Currencies supported by the app. Amounts are stored as plain numbers and
// changing currency only changes how they are displayed (no conversion).
const SUPPORTED_CURRENCIES = [
  'USD',
  'PKR',
  'EUR',
  'GBP',
  'INR',
  'AED',
  'SAR',
  'CAD',
  'AUD',
];

const DEFAULT_CURRENCY = 'USD';

module.exports = {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
};
