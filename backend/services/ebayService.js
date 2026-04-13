const axios = require('axios');
const cheerio = require('cheerio');

async function getEbaySoldComps(query) {
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(data);

    const comps = [];

    $('.s-item').each((i, el) => {
      if (comps.length >= 3) return;

      const title = $(el).find('.s-item__title').text();
      const price = $(el).find('.s-item__price').text();
      const link = $(el).find('.s-item__link').attr('href');

      if (!title || !price || !link) return;
      if (title.toLowerCase().includes('shop on ebay')) return;

      comps.push({
        title,
        price,
        url: link,
        label: 'sold recently'
      });
    });

    return comps;
  } catch (err) {
    console.error('[eBay scrape error]', err.message);
    return [];
  }
}

module.exports = { getEbaySoldComps };
