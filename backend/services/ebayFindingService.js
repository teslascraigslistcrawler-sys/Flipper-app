const axios = require('axios');

const EBAY_APP_ID = process.env.EBAY_APP_ID;

async function getSoldComps(query) {
  const url = 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1';

  const params = {
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.13.0',
    'SECURITY-APPNAME': EBAY_APP_ID,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'REST-PAYLOAD': true,
    'keywords': query,
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    'paginationInput.entriesPerPage': '20'
  };

  try {
    const res = await axios.get(url, { params });

    const root = res.data?.findCompletedItemsResponse?.[0];
    const ack = root?.ack?.[0];
    const errors = root?.errorMessage?.[0]?.error || [];

    if (ack && ack !== 'Success') {
      throw new Error(
        'Finding API ack=' + ack + ' ' +
        errors.map(e => `${e.errorId?.[0]}:${e.message?.[0]}`).join(' | ')
      );
    }

    const items = root?.searchResult?.[0]?.item || [];

    const prices = items
      .map(i => parseFloat(i?.sellingStatus?.[0]?.currentPrice?.[0]?.__value__))
      .filter(p => !isNaN(p));

    return prices;
  } catch (err) {
    console.error('Finding API error:', err.response?.data || err.message || err);
    throw err;
  }
}

module.exports = { getSoldComps };
