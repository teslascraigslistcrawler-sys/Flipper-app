'use strict';

/**
 * pricingEngine.js
 *
 * Purpose:
 * - Normalize sold/active comps
 * - Remove bad outliers
 * - Apply condition/package multipliers
 * - Apply category-specific boosts
 * - Return actionable pricing for UI + eBay draft generation
 *
 * Works with CommonJS / Node / Express.
 */

const HOT_SUBJECTS = new Set([
  'Tiger Woods',
  'Arnold Schwarzenegger',
  'Sharon Stone',
  'Morgan Freeman',
  'LeBron James',
  'Colin Kaepernick',
  'The Rock',
  'Francis Ford Coppola',
  'Tom Selleck',
  'William Shatner',
  'Kiefer Sutherland',
  'The Sopranos',
  'Tony Soprano',
  'Winston Churchill',
  'Tommy Franks',
  'Jimmy Smits',
  'Alec Baldwin',
  'Steve Wynn',
  'Tyson',
  'Mike Tyson',
  'Kurt Russell',
  'Steph Curry',
]);

const CONDITION_TYPES = [
  'sealed',
  'new',
  'new_unread',
  'unopened_box',
  'open_box',
  'like_new',
  'very_good',
  'good',
  'fair',
  'poor',
  'for_parts',
];

const PACKAGE_STATES = [
  'factory_sealed',
  'original_sleeve',
  'unopened_box',
  'open_box',
  'no_packaging',
];

function roundMoney(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function median(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function average(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function percentile(numbers, p) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function normalizePriceArray(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map(toNumber)
    .filter((n) => Number.isFinite(n) && n > 0);
}

function filterOutliers(prices) {
  const clean = normalizePriceArray(prices);
  if (clean.length <= 3) return clean;

  // Robust filter using IQR
  const q1 = percentile(clean, 0.25);
  const q3 = percentile(clean, 0.75);
  const iqr = q3 - q1;

  const lowerBound = Math.max(0.01, q1 - 1.5 * iqr);
  const upperBound = q3 + 1.5 * iqr;

  const filtered = clean.filter((price) => price >= lowerBound && price <= upperBound);

  // Fallback if too aggressive
  return filtered.length >= 2 ? filtered : clean;
}

function fallbackPricing() {
  return {
    soldMedian: 0,
    soldLow: 0,
    soldHigh: 0,
    activeMedian: 0,
    confidence: 0.2,
    recommendedBIN: 19.99,
    recommendedAuctionStart: 9.99,
    recommendedAcceptMin: 12.99,
    pricingSource: 'fallback',
    compSampleSize: 0,
  };
}

function computeBasePricing({ soldPrices = [], activePrices = [] }) {
  const sold = filterOutliers(soldPrices);
  const active = filterOutliers(activePrices);

  if (sold.length < 2) {
    const fallback = fallbackPricing();
    fallback.activeMedian = roundMoney(median(active));
    return fallback;
  }

  const soldMedian = roundMoney(median(sold));
  const soldLow = roundMoney(Math.min(...sold));
  const soldHigh = roundMoney(Math.max(...sold));
  const activeMedian = roundMoney(median(active));

  // Price from solds first. Active is informational only.
  let recommendedBIN = soldHigh > 0 ? soldHigh * 0.97 : soldMedian * 1.15;
  let recommendedAcceptMin = soldMedian * 0.82;
  let recommendedAuctionStart = soldLow > 0 ? soldLow * 0.92 : soldMedian * 0.7;

  // Keep BIN from getting silly low relative to median
  if (recommendedBIN < soldMedian * 1.05) {
    recommendedBIN = soldMedian * 1.08;
  }

  // Keep accept minimum above auction start
  if (recommendedAcceptMin < recommendedAuctionStart) {
    recommendedAcceptMin = recommendedAuctionStart * 1.1;
  }

  // Confidence based on sold comp count
  const confidence = Math.min(1, 0.25 + sold.length * 0.1);

  return {
    soldMedian,
    soldLow,
    soldHigh,
    activeMedian,
    confidence: roundMoney(confidence),
    recommendedBIN: roundMoney(recommendedBIN),
    recommendedAuctionStart: roundMoney(recommendedAuctionStart),
    recommendedAcceptMin: roundMoney(recommendedAcceptMin),
    pricingSource: 'sold_comps',
    compSampleSize: sold.length,
  };
}

function getConditionMultiplier(condition) {
  const multipliers = {
    sealed: 1.3,
    new: 1.2,
    new_unread: 1.22,
    unopened_box: 1.18,
    open_box: 1.05,
    like_new: 1.1,
    very_good: 1.0,
    good: 0.88,
    fair: 0.72,
    poor: 0.55,
    for_parts: 0.35,
  };

  return multipliers[condition] ?? 1.0;
}

function getPackageMultiplier(packageState) {
  const multipliers = {
    factory_sealed: 1.12,
    original_sleeve: 1.08,
    unopened_box: 1.1,
    open_box: 1.0,
    no_packaging: 0.97,
  };

  return multipliers[packageState] ?? 1.0;
}

function applyConditionAdjustments(price, itemCondition, packageState) {
  const adjusted = price * getConditionMultiplier(itemCondition) * getPackageMultiplier(packageState);
  return roundMoney(adjusted);
}

function applyCategoryBoost(item, price) {
  let boosted = price;

  const category = String(item.category || '').toLowerCase();
  const subject = String(item.coverSubject || item.subject || '').trim();
  const publication = String(item.publication || '').toLowerCase();
  const title = String(item.title || '').toLowerCase();

  if (HOT_SUBJECTS.has(subject)) {
    boosted *= 1.15;
  }

  if (category === 'magazine') {
    boosted *= 1.05;
  }

  if (publication.includes('cigar aficionado')) {
    boosted *= 1.06;
  }

  if (publication === 'gq' && subject) {
    boosted *= 1.03;
  }

  if (title.includes('anniversary') || title.includes('collector')) {
    boosted *= 1.06;
  }

  return roundMoney(boosted);
}

function computeProfit({
  salePrice = 0,
  purchasePrice = 0,
  shippingCharge = 0,
  estimatedShippingCost = 0,
  feeRate = 0.1325,
  fixedFee = 0.3,
}) {
  const grossCollected = salePrice + shippingCharge;
  const estimatedFees = grossCollected * feeRate + fixedFee;
  const profit = grossCollected - estimatedFees - estimatedShippingCost - purchasePrice;

  return {
    estimatedFees: roundMoney(estimatedFees),
    estimatedProfit: roundMoney(profit),
  };
}

function buildSmartPricing(item = {}, comps = {}) {
  const soldPrices = normalizePriceArray(comps.soldPrices || comps.sold || []);
  const activePrices = normalizePriceArray(comps.activePrices || comps.active || []);

  let base = computeBasePricing({ soldPrices, activePrices });

  const itemCondition = item.itemCondition || item.condition || 'very_good';
  const packageState = item.packageState || (item.sealed ? 'factory_sealed' : 'no_packaging');

  let recommendedBIN = applyConditionAdjustments(
    base.recommendedBIN,
    itemCondition,
    packageState
  );

  let recommendedAcceptMin = applyConditionAdjustments(
    base.recommendedAcceptMin,
    itemCondition,
    packageState
  );

  let recommendedAuctionStart = applyConditionAdjustments(
    base.recommendedAuctionStart,
    itemCondition,
    packageState
  );

  recommendedBIN = applyCategoryBoost(item, recommendedBIN);
  recommendedAcceptMin = applyCategoryBoost(item, recommendedAcceptMin);
  recommendedAuctionStart = applyCategoryBoost(item, recommendedAuctionStart);

  // Round to common eBay style endings
  recommendedBIN = normalizeRetailEnding(recommendedBIN);
  recommendedAcceptMin = normalizeRetailEnding(recommendedAcceptMin);
  recommendedAuctionStart = normalizeAuctionEnding(recommendedAuctionStart);

  const shippingSuggested = suggestShipping(item);
  const reserveSuggested = suggestedReserve({
    recommendedBIN,
    recommendedAcceptMin,
    category: item.category,
  });

  const binProfit = computeProfit({
    salePrice: recommendedBIN,
    purchasePrice: Number(item.purchasePrice || 0),
    shippingCharge: shippingSuggested,
    estimatedShippingCost: shippingSuggested,
  });

  const acceptProfit = computeProfit({
    salePrice: recommendedAcceptMin,
    purchasePrice: Number(item.purchasePrice || 0),
    shippingCharge: shippingSuggested,
    estimatedShippingCost: shippingSuggested,
  });

  return {
    ...base,
    itemCondition,
    packageState,
    recommendedBIN,
    recommendedAuctionStart,
    recommendedAcceptMin,
    recommendedReserve: reserveSuggested,
    shippingSuggested,
    estimatedFeesAtBIN: binProfit.estimatedFees,
    estimatedProfitAtBIN: binProfit.estimatedProfit,
    estimatedFeesAtAcceptMin: acceptProfit.estimatedFees,
    estimatedProfitAtAcceptMin: acceptProfit.estimatedProfit,
  };
}

function normalizeRetailEnding(price) {
  if (!Number.isFinite(price) || price <= 0) return 19.99;

  if (price < 10) return roundMoney(Math.floor(price) + 0.99);
  if (price < 25) return roundMoney(Math.floor(price) + 0.99);
  if (price < 100) return roundMoney(Math.floor(price) + 0.99);

  return roundMoney(Math.round(price));
}

function normalizeAuctionEnding(price) {
  if (!Number.isFinite(price) || price <= 0) return 9.99;
  return roundMoney(Math.floor(price) + 0.99);
}

function suggestShipping(item = {}) {
  const category = String(item.category || '').toLowerCase();
  const weightOz = Number(item.weightOz || 0);

  if (weightOz > 0) {
    if (weightOz <= 8) return 5.99;
    if (weightOz <= 16) return 7.99;
    if (weightOz <= 32) return 9.99;
    return 12.99;
  }

  if (category === 'magazine') return 6.99;
  return 8.99;
}

function suggestedReserve({ recommendedBIN = 0, recommendedAcceptMin = 0 }) {
  if (!recommendedBIN) return 0;
  const reserve = Math.max(recommendedAcceptMin, recommendedBIN * 0.68);
  return roundMoney(reserve);
}

function displayConditionLabel(value) {
  const labels = {
    sealed: 'Sealed',
    new: 'New',
    new_unread: 'New / Unread',
    unopened_box: 'Unopened Box',
    open_box: 'Open Box',
    like_new: 'Like New',
    very_good: 'Very Good',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    for_parts: 'For Parts / Untested',
  };

  return labels[value] || value || 'Unknown';
}

function displayPackageLabel(value) {
  const labels = {
    factory_sealed: 'Factory Sealed',
    original_sleeve: 'Original Protective Sleeve',
    unopened_box: 'Unopened Box',
    open_box: 'Open Box',
    no_packaging: 'No Packaging',
  };

  return labels[value] || value || 'Unknown';
}

module.exports = {
  CONDITION_TYPES,
  PACKAGE_STATES,
  roundMoney,
  normalizePriceArray,
  filterOutliers,
  fallbackPricing,
  computeBasePricing,
  getConditionMultiplier,
  getPackageMultiplier,
  applyConditionAdjustments,
  applyCategoryBoost,
  computeProfit,
  buildSmartPricing,
  normalizeRetailEnding,
  normalizeAuctionEnding,
  suggestShipping,
  suggestedReserve,
  displayConditionLabel,
  displayPackageLabel,
};
