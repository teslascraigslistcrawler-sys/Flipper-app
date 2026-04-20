const axios = require('axios');

const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const EBAY_ENV = (process.env.EBAY_ENV || 'production').toLowerCase();

const API_BASE =
  EBAY_ENV === 'sandbox'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com';

let accessToken = null;
let tokenExpiry = 0;

function money(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean).map(x => String(x).trim()).filter(Boolean))];
}

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await axios.post(
    `${API_BASE}/identity/v1/oauth2/token`,
    'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`
      }
    }
  );

  accessToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in * 1000 - 60000);

  return accessToken;
}

function buildQueries(item) {
  const publication = item.publication || '';
  const subject = item.coverSubject || '';
  const issue = String(item.issueLabel || '').replace('/', ' ');
  const yearMatch = issue.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : '';
  const itemType = item.itemType || item.category || 'magazine';

  if (String(item.category || '').toLowerCase().includes('magazine')) {
    return uniq([
      `${publication} ${subject} magazine`,
      `${publication} ${subject} ${year} magazine`,
      `${publication} ${year} magazine`,
      `${subject} ${publication}`,
      `${publication} cover ${subject}`
    ]);
  }

  return uniq([
    `${item.brand || ''} ${item.model || ''} ${itemType}`,
    `${item.brand || ''} ${item.model || ''}`,
    `${item.title || ''}`,
    `${item.brand || ''} ${itemType}`
  ]);
}

function detectCondition(title, apiCondition = '') {
  const t = normalize(title);
  const c = normalize(apiCondition);

  if (
    t.includes('sealed') ||
    t.includes('unread') ||
    t.includes('factory sealed') ||
    c.includes('new')
  ) return 'new';

  if (t.includes('near mint') || t.includes('mint') || t.includes('nm')) return 'near_mint';
  if (t.includes('very good') || t.includes('good') || c.includes('used')) return 'used';
  if (t.includes('damaged') || t.includes('poor') || t.includes('torn') || t.includes('for parts')) return 'damaged';

  return 'unknown';
}

function targetCondition(item) {
  const raw = normalize(item.itemCondition || item.condition || '');
  if (raw.includes('new') || raw.includes('sealed') || raw.includes('unread')) return 'new';
  if (raw.includes('mint')) return 'near_mint';
  if (raw.includes('good') || raw.includes('used')) return 'used';
  if (raw.includes('damaged') || raw.includes('poor')) return 'damaged';
  return 'unknown';
}

function conditionWeight(listingCondition, target) {
  const table = {
    new:       { new: 1.00, near_mint: 0.93, used: 0.78, damaged: 0.45, unknown: 0.82 },
    near_mint: { new: 1.05, near_mint: 1.00, used: 0.82, damaged: 0.48, unknown: 0.86 },
    used:      { new: 1.18, near_mint: 1.10, used: 1.00, damaged: 0.62, unknown: 0.92 },
    damaged:   { new: 1.45, near_mint: 1.35, used: 1.15, damaged: 1.00, unknown: 1.05 },
    unknown:   { new: 1.12, near_mint: 1.06, used: 0.96, damaged: 0.70, unknown: 1.00 }
  };

  return table[target]?.[listingCondition] ?? 1.0;
}

function scoreListing(item, listing) {
  const title = normalize(listing.title);
  const publication = normalize(item.publication);
  const subject = normalize(item.coverSubject);
  const issue = normalize(item.issueLabel);

  let score = 0;

  if (publication && title.includes(publication)) score += 5;
  if (subject && title.includes(subject)) score += 5;
  if (title.includes('magazine')) score += 2;

  for (const tok of issue.split(' ')) {
    if (tok.length > 2 && title.includes(tok)) score += 1;
  }

  const junk = ['lot', 'bundle', 'subscription', 'poster', 'framed', 'autograph', 'reprint', 'digital'];
  for (const bad of junk) {
    if (title.includes(bad)) score -= 4;
  }

  return score;
}

function dedupeListings(listings) {
  const seen = new Set();
  const out = [];

  for (const item of listings) {
    const key = `${normalize(item.title)}|${money(item.rawPrice)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

async function fetchRawBrowseResults(query) {
  const token = await getAccessToken();

  const res = await axios.get(
    `${API_BASE}/buy/browse/v1/item_summary/search`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
      },
      params: {
        q: query,
        limit: 20
      }
    }
  );

  return res.data.itemSummaries || [];
}

async function fetchBrowseCompsForItem(item) {
  const queries = buildQueries(item);
  const target = targetCondition(item);

  let listings = [];

  for (const query of queries) {
    const results = await fetchRawBrowseResults(query);

    const mapped = results
      .map(r => {
        const rawPrice = Number(r.price?.value);
        if (!Number.isFinite(rawPrice) || rawPrice <= 0) return null;

        const listingCondition = detectCondition(r.title, r.condition);
        const score = scoreListing(item, r);

        return {
          query,
          title: r.title || '',
          itemWebUrl: r.itemWebUrl || '',
          apiCondition: r.condition || '',
          rawPrice: money(rawPrice),
          listingCondition,
          score,
          adjustedPrice: money(rawPrice * conditionWeight(listingCondition, target))
        };
      })
      .filter(Boolean);

    listings.push(...mapped);
  }

  listings = dedupeListings(listings)
    .filter(x => x.score >= 4)
    .sort((a, b) => b.score - a.score);

  return {
    queries,
    targetCondition: target,
    listings,
    activePrices: listings.map(x => x.adjustedPrice),
    rawActivePrices: listings.map(x => x.rawPrice)
  };
}

module.exports = {
  buildQueries,
  detectCondition,
  fetchBrowseCompsForItem
};
