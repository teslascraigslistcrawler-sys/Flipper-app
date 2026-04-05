/**
 * profitCalculator.js
 * Core financial logic for Flipper.
 * All fee and profit calculations live here — never inline.
 */

const FEE_RATE = 0.13; // 13% combined platform + shipping estimate

/**
 * Calculate mid-point value from low/high range.
 */
export function calcMidValue(low, high) {
  return Math.round((low + high) / 2);
}

/**
 * Calculate fees based on mid estimated value.
 */
export function calcFees(estimatedValueMid) {
  return Math.round(estimatedValueMid * FEE_RATE * 100) / 100;
}

/**
 * Calculate net profit.
 * profit = estimatedValueMid - buyPrice - fees
 */
export function calcProfit(estimatedValueMid, buyPrice, fees) {
  return Math.round((estimatedValueMid - (buyPrice || 0) - fees) * 100) / 100;
}

/**
 * Calculate return on investment as a percentage.
 */
export function calcROI(profit, buyPrice) {
  if (!buyPrice || buyPrice === 0) return null;
  return Math.round((profit / buyPrice) * 100);
}

/**
 * Full calculation bundle — call this whenever inputs change.
 */
export function calcAll({ valueEstimateLow, valueEstimateHigh, buyPrice }) {
  const mid  = calcMidValue(valueEstimateLow, valueEstimateHigh);
  const fees  = calcFees(mid);
  const profit = calcProfit(mid, buyPrice, fees);
  const roi   = calcROI(profit, buyPrice);
  return { valueEstimateMid: mid, fees, profit, roi };
}

/**
 * Format a number as USD currency string.
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return (value < 0 ? '-' : '') + '$' + formatted;
}

/**
 * Determine profit sentiment for UI coloring.
 * Returns 'good' | 'ok' | 'bad'
 */
export function profitSentiment(profit, buyPrice) {
  if (!buyPrice) return 'neutral';
  const roi = calcROI(profit, buyPrice);
  if (roi >= 30) return 'good';
  if (roi >= 10) return 'ok';
  return 'bad';
}
