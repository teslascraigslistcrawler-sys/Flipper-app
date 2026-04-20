const axios = require('axios');

const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await axios.post(
    'https://api.ebay.com/identity/v1/oauth2/token',
    'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      }
    }
  );

  accessToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in * 1000 - 60000);

  return accessToken;
}

async function fetchBrowseComps(query) {
  const token = await getAccessToken();

  const res = await axios.get('https://api.ebay.com/buy/browse/v1/item_summary/search', {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params: {
      q: query,
      limit: 20
    }
  });

  const items = res.data.itemSummaries || [];

  const prices = items
    .map(i => parseFloat(i.price?.value))
    .filter(p => !isNaN(p));

  return prices;
}

module.exports = { fetchBrowseComps };
