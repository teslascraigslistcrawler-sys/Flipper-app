'use strict';

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
  return Math.round(Number(value || 0) * 100) / 100;
}

function normalizePriceArray(values) {
  return (Array.isArray(values) ? values : [])
    .map(v => Number(v))
    .filter(v => Number.isFinite(v) && v > 0);
}

function median(values) {
  const arr = [...values].sort((a, b) => a - b);
  if (!arr.length) return 0;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function percentile(values, pct) {
  const arr = [...values].sort((a, b) => a - b);
  if (!arr.length) return 0;
  const idx = Math.floor((arr.length - 1) * pct);
  return arr[idx];
}

function priceOutlierFilter(prices = []) {
  const arr = normalizePriceArray(prices).sort((a, b) => a - b);
  if (arr.length <= 4) return arr;

  const q1 = percentile(arr, 0.25);
  const q3 = percentile(arr, 0.75);
  const iqr = q3 - q1;

  const low = Math.max(0, q1 - 1.5 * iqr);
  const high = q3 + 1.5 * iqr;

  const filtered = arr.filter(p => p >= low && p <= high);
  return filtered.length >= 3 ? filtered : arr;
}

function getConditionMultiplier(condition) {
  const multipliers = {
    sealed: 1.30,
    new: 1.20,
    new_unread: 1.22,
    unopened_box: 1.18,
    open_box: 1.05,
    like_new: 1.10,
    very_good: 1.00,
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
    unopened_box: 1.10,
    open_box: 1.00,
    no_packaging: 0.97
  };
  return multipliers[packageState] ?? 1.0;
}

function applyConditionAdjustments(price, itemCondition, packageState) {
  return roundMoney(
    price *
    getConditionMultiplier(itemCondition) *
    getPackageMultiplier(packageState)
  );
}

function normalizeRetailEnding(price) {
  if (!Number.isFinite(price) || price <= 0) return 19.99;
  if (price < 100) return roundMoney(Math.floor(price) + 0.99);
  return roundMoney(Math.round(price));
}

function normalizeAuctionEnding(price) {
  if (!Number.isFinite(price) || price <= 0) return 9.99;
  return roundMoney(Math.floor(price) + 0.99);
}

function suggestShipping(item = {}) {
  const category = String(item.category || '').toLowerCase();
  if (category.includes('magazine')) return 6.99;
  return 8.99;
}

function computeProfit({
  salePrice = 0,
  purchasePrice = 0,
  shippingCharge = 0,
  estimatedShippingCost = 0,
  feeRate = 0.1325,
  fixedFee = 0.30
}) {
  const gross = salePrice + shippingCharge;
  const estimatedFees = gross * feeRate + fixedFee;
  const estimatedProfit = gross - estimatedFees - estimatedShippingCost - purchasePrice;

  return {
    estimatedFees: roundMoney(estimatedFees),
    estimatedProfit: roundMoney(estimatedProfit)
  };
}

function buildSmartPricing(item = {}, comps = {}) {
  const sold = priceOutlierFilter(comps.soldPrices || []);
  const active = priceOutlierFilter(comps.activePrices || []);

  const itemCondition = item.itemCondition || item.condition || 'very_good';
  const packageState = item.packageState || (item.sealed ? 'factory_sealed' : 'no_packaging');

  const soldMedian = roundMoney(median(sold));
  const soldLow = roundMoney(percentile(sold, 0.2));
  const soldHigh = roundMoney(percentile(sold, 0.8));

  const activeMedian = roundMoney(median(active));
  const activeLow = roundMoney(percentile(active, 0.2));
  const activeHigh = roundMoney(percentile(active, 0.8));

  const hasSold = sold.length > 0;
  const hasActive = active.length > 0;

  let baseMedian = hasSold ? soldMedian : activeMedian;
  let baseLow = hasSold ? soldLow : activeLow;
  let baseHigh = hasSold ? soldHigh : activeHigh;

  if (!hasSold && !hasActive) {
    baseMedian = 24.99;
    baseLow = 16.99;
    baseHigh = 33.99;
  }

  let recommendedBIN = applyConditionAdjustments(baseHigh || baseMedian * 1.08, itemCondition, packageState);
  let recommendedAcceptMin = applyConditionAdjustments(baseMedian * 0.90, itemCondition, packageState);
  let recommendedAuctionStart = applyConditionAdjustments((baseLow || baseMedian * 0.75) * 0.95, itemCondition, packageState);

  recommendedBIN = normalizeRetailEnding(recommendedBIN);
  recommendedAcceptMin = normalizeRetailEnding(recommendedAcceptMin);
  recommendedAuctionStart = normalizeAuctionEnding(recommendedAuctionStart);

  const compSampleSize = sold.length + active.length;
  const confidence = roundMoney(Math.min(1, 0.2 + compSampleSize * 0.05));

  const shippingSuggested = suggestShipping(item);

  const binProfit = computeProfit({
    salePrice: recommendedBIN,
    purchasePrice: Number(item.purchasePrice || 0),
    shippingCharge: shippingSuggested,
    estimatedShippingCost: shippingSuggested
  });

  const acceptProfit = computeProfit({
    salePrice: recommendedAcceptMin,
    purchasePrice: Number(item.purchasePrice || 0),
    shippingCharge: shippingSuggested,
    estimatedShippingCost: shippingSuggested
  });

  return {
    soldMedian,
    soldLow,
    soldHigh,
    activeMedian,
    activeLow,
    activeHigh,
    confidence,
    recommendedBIN,
    recommendedAuctionStart,
    recommendedAcceptMin,
    pricingSource: hasSold ? 'sold_comps' : (hasActive ? 'active_comps' : 'fallback'),
    compSampleSize,
    itemCondition,
    packageState,
    recommendedReserve: roundMoney(recommendedAcceptMin * 1.05),
    shippingSuggested,
    estimatedFeesAtBIN: binProfit.estimatedFees,
    estimatedProfitAtBIN: binProfit.estimatedProfit,
    estimatedFeesAtAcceptMin: acceptProfit.estimatedFees,
    estimatedProfitAtAcceptMin: acceptProfit.estimatedProfit
  };
}

module.exports = {
  CONDITION_TYPES,
  PACKAGE_STATES,
  buildSmartPricing
};
