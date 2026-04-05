/**
 * mockFallback.js
 *
 * Returns plausible mock data when the Vision API is unavailable.
 * Used in development or when API key is not configured.
 */

const MOCK_ITEMS = [
  {
    suggestedName: 'Apple iPhone 13',
    possibleBrand: 'Apple',
    possibleModel: 'iPhone 13',
    category: 'Smartphone',
    confidenceScore: 0.82,
    valueEstimateLow: 180,
    valueEstimateHigh: 320,
    suggestedSearchQuery: 'Apple iPhone 13 resale value site:ebay.com',
  },
  {
    suggestedName: 'Nike Air Max 90',
    possibleBrand: 'Nike',
    possibleModel: 'Air Max 90',
    category: 'Sneakers',
    confidenceScore: 0.75,
    valueEstimateLow: 60,
    valueEstimateHigh: 140,
    suggestedSearchQuery: 'Nike Air Max 90 resale value site:ebay.com',
  },
  {
    suggestedName: 'Sony WH-1000XM5 Headphones',
    possibleBrand: 'Sony',
    possibleModel: 'WH-1000XM5',
    category: 'Headphones',
    confidenceScore: 0.88,
    valueEstimateLow: 120,
    valueEstimateHigh: 240,
    suggestedSearchQuery: 'Sony WH-1000XM5 resale value site:ebay.com',
  },
];

function getMockFallback() {
  // Return a random mock item to simulate variety
  const item = MOCK_ITEMS[Math.floor(Math.random() * MOCK_ITEMS.length)];
  return {
    ...item,
    _isMock: true,
  };
}

module.exports = { getMockFallback };
