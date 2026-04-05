const FEE_RATE = 0.13;

const BRAND_TIERS = {
  apple: 1, sony: 1, bose: 1, dyson: 1, samsung: 1,
  nintendo: 1, playstation: 1, microsoft: 1, gopro: 2,
  canon: 2, nikon: 2, jbl: 2, dell: 2, hp: 2, lenovo: 2,
  anker: 3, insignia: 3, 'louis vuitton': 1, gucci: 1,
  prada: 1, 'canada goose': 1, rolex: 1, 'north face': 2,
  patagonia: 2, 'ralph lauren': 2, coach: 2, nike: 2,
  adidas: 2, jordan: 1, supreme: 1, 'new balance': 2,
  lego: 2, funko: 2, 'hot wheels': 2,
};

const CATEGORY_BASE_RANGES = {
  'smartphone':        [80,  350],
  'laptop':            [120, 600],
  'tablet':            [60,  300],
  'gaming console':    [120, 450],
  'video game':        [10,  60],
  'headphones':        [20,  180],
  'camera':            [40,  300],
  'smartwatch':        [50,  250],
  'television':        [80,  400],
  'speaker':           [20,  150],
  'keyboard':          [15,  120],
  'drone':             [80,  400],
  'jacket':            [15,  120],
  'sneakers':          [25,  200],
  'handbag':           [30,  800],
  'watch':             [30,  1500],
  'sunglasses':        [10,  200],
  'toy':               [5,   60],
  'book':              [1,   25],
  'record':            [5,   50],
  'tools':             [10,  80],
  'power tool':        [30,  200],
  'kitchen appliance': [15,  120],
  'bicycle':           [80,  600],
  'collectible':       [10,  300],
  'default':           [10,  80],
};

const BRAND_TIER_MULTIPLIERS = {
  1: [1.8, 3.5],
  2: [1.0, 2.0],
  3: [0.4, 0.8],
};

function normalizeText(str) {
  return (str || '').toLowerCase().trim();
}

function detectBrand(logos, webEntities) {
  const candidates = [
    ...logos.map(l => normalizeText(l.description)),
    ...webEntities.map(e => normalizeText(e.description)),
  ];
  for (const candidate of candidates) {
    for (const brand of Object.keys(BRAND_TIERS)) {
      if (candidate.includes(brand)) {
        return brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
  }
  return null;
}

function estimateValue(category, brandName) {
  const baseRange = CATEGORY_BASE_RANGES[category] || CATEGORY_BASE_RANGES['default'];
  const brandKey = normalizeText(brandName || '');
  const tier = BRAND_TIERS[brandKey] || null;
  if (tier) {
    const m = BRAND_TIER_MULTIPLIERS[tier];
    return { low: Math.round(baseRange[0] * m[0]), high: Math.round(baseRange[1] * m[1]) };
  }
  return { low: baseRange[0], high: baseRange[1] };
}

function parseVisionResponse(visionResponse) {
  const labels       = visionResponse.labelAnnotations || [];
  const logos        = visionResponse.logoAnnotations || [];
  const webEntities  = (visionResponse.webDetection || {}).webEntities || [];
  const ocrLines     = (visionResponse.textAnnotations || []).map(t => t.description).filter(Boolean);

  // Use OpenAI's direct category if provided
  const category = visionResponse._openaiCategory || 'default';
  const brand    = detectBrand(logos, webEntities);

  // Use OpenAI's model hint or best web entity
  const model = visionResponse._openaiModel ||
    (webEntities.find(e => e.score > 0.5) || {}).description ||
    null;

  // Build item name
  const bestEntity = webEntities.find(e => e.score > 0.5);
  const itemName = bestEntity?.description ||
    model ||
    (brand ? `${brand} ${category}` : null) ||
    (labels[0]?.description) ||
    'Unknown Item';

  const value = estimateValue(category, brand);

  const searchParts = [brand, model || itemName].filter(Boolean);
  const suggestedSearchQuery = `${searchParts.join(' ')} resale site:ebay.com`;

  const confidence = Math.min(
    0.3 +
    (labels.length > 3 ? 0.15 : 0) +
    (logos.length > 0 ? 0.2 : 0) +
    (webEntities.some(e => e.score > 0.7) ? 0.2 : 0) +
    (category !== 'default' ? 0.15 : 0),
    1.0
  );

  return {
    suggestedName: itemName,
    possibleBrand: brand || 'Unknown',
    possibleModel: model || 'Unknown',
    category: category.replace(/\b\w/g, c => c.toUpperCase()),
    confidenceScore: Math.round(confidence * 100) / 100,
    valueEstimateLow: value.low,
    valueEstimateHigh: value.high,
    suggestedSearchQuery,
  };
}

module.exports = { parseVisionResponse, estimateValue };
