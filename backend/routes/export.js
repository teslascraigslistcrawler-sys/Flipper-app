'use strict';

const express = require('express');
const router = express.Router();
const { generateEbayDraft } = require('../services/ebayTemplateService');

async function getItemById(id) {
  return {
    id: String(id),
    category: 'magazine',
    publication: 'Cigar Aficionado',
    coverSubject: 'Sharon Stone',
    issueLabel: 'July/Aug 2004',
    title: '',
    sealed: true,
    itemCondition: 'new_unread',
    packageState: 'original_sleeve',
    purchasePrice: 0,
    quantity: 1,
    weightOz: 14,
    sourcePhotoUrls: [],
    ebayCategoryId: '280',
    comps: {
      soldPrices: [18.99, 22.5, 29.99, 34.99, 39.99],
      activePrices: [24.99, 29.99, 44.99, 49.99]
    }
  };
}

function toExportShape(draft) {
  return {
    title: draft.title,
    price: draft.pricing.recommendedBIN,
    acceptMin: draft.pricing.recommendedAcceptMin,
    shipping: draft.pricing.shippingSuggested,
    profit: draft.pricing.estimatedProfitAtBIN,
    description: draft.description
  };
}

router.get('/items/:id', async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    const draft = generateEbayDraft(item);
    const exportData = toExportShape(draft);

    return res.json({
      success: true,
      export: exportData
    });
  } catch (err) {
    console.error('export json error:', err);
    return res.status(500).json({
      success: false,
      error: 'Export failed'
    });
  }
});

router.get('/text/:id', async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    const draft = generateEbayDraft(item);
    const exportData = toExportShape(draft);

    const text = `TITLE:
${exportData.title}

PRICE:
${exportData.price}

ACCEPT OFFERS ABOVE:
${exportData.acceptMin}

SHIPPING:
${exportData.shipping}

PROFIT:
${exportData.profit}

DESCRIPTION:
${exportData.description}
`;

    res.type('text/plain').send(text);
  } catch (err) {
    console.error('export text error:', err);
    return res.status(500).json({
      error: 'Export text failed'
    });
  }
});

module.exports = router;
