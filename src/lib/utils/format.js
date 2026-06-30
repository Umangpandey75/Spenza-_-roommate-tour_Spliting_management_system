import { CURRENCIES } from './constants';

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (e.g., 'USD')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = 'INR', options = {}) {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options;

  if (!showSymbol) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Get currency symbol from currency code
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currencyCode) {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.symbol : currencyCode;
}

/**
 * Format a date for display
 * @param {Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const {
    dateStyle = 'medium',
    timeStyle,
  } = options;

  return new Intl.DateTimeFormat('en-US', {
    dateStyle,
    timeStyle,
  }).format(new Date(date));
}

/**
 * Format a number with proper decimal places
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
  return Number(num).toFixed(decimals);
}