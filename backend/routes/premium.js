'use strict';

/**
 * premium.js
 *
 * Purpose:
 * - Routes for upgraded pricing and eBay draft generation
 *
 * Mount with:
 *   app.use('/api/premium', require('./routes/premium'));
 */

const express = require('express');
const router = express.Router();

const {
  CONDITION_TYPES,
  PACKAGE_STATES,
  buildSmartPricing,
} = require('../services/pricingEngine');

const {
  generateEbayDraft,
} = require('../services/ebayTemplateService');

/**
 * TEMP in-memory item fetcher.
 * Replace later with your DB lookup.
 */
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
    comps: {
      soldPrices: [18.99, 22.5, 29.99, 34.99, 39.99],
      activePrices: [24.99, 29.99, 44.99, 49.99],
    },
  };
}

/**
 * POST /api/premium/pricing/preview
 * Body:
 * {
 *   item: {...},
 *   comps: {
 *     soldPrices: [..],
 *     activePrices: [..]
 *   }
 * }
 */
router.post('/pricing/preview', async (req, res) => {
  try {
    const item = req.body.item || {};
    const comps = req.body.comps || item.comps || {};
    const pricing = buildSmartPricing(item, comps);

    return res.json({
      success: true,
      pricing,
      enums: {
        conditionTypes: CONDITION_TYPES,
        packageStates: PACKAGE_STATES,
      },
    });
  } catch (error) {
    console.error('pricing/preview error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to build pricing preview',
    });
  }
});

/**
 * GET /api/premium/items/:id/pricing
 */
router.get('/items/:id/pricing', async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    const pricing = buildSmartPricing(item, item.comps || {});

    return res.json({
      success: true,
      item,
      pricing,
    });
  } catch (error) {
    console.error('items/:id/pricing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get item pricing',
    });
  }
});

/**
 * POST /api/premium/items/:id/generate-ebay-draft
 */
router.post('/items/:id/generate-ebay-draft', async (req, res) => {
  try {
    const baseItem = await getItemById(req.params.id);

    // Allow request body overrides from frontend edits
    const item = {
      ...baseItem,
      ...(req.body.item || {}),
    };

    const draft = generateEbayDraft(item, req.body.policies || {});

    return res.json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error('generate-ebay-draft error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate eBay draft',
    });
  }
});

module.exports = router;

// TEXT EXPORT (for fast eBay listing)
router.get('/export/text/:id', async (req, res) => {
  try {
    const exportData = await generateExport(req.params.id);

    const text = `
TITLE:
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

    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export text failed' });
  }
});

