const express = require('express');
const router = express.Router();

const {
  CONDITION_TYPES,
  PACKAGE_STATES,
  buildSmartPricing
} = require('../services/smartPricingEngine');

const {
  generateEbayDraft
} = require('../services/ebayTemplateService');

const {
  fetchBrowseCompsForItem
} = require('../services/smartBrowseService');

async function getItemById(id) {
  return {
    id: String(id),
    category: 'magazine',
    publication: 'Cigar Aficionado',
    coverSubject: 'Sharon Stone',
    issueLabel: 'July/Aug 2004',
    title: '',
    brand: '',
    model: '',
    itemType: 'magazine',
    sealed: true,
    itemCondition: 'new_unread',
    packageState: 'original_sleeve',
    purchasePrice: 0,
    quantity: 1,
    weightOz: 14,
    sourcePhotoUrls: []
  };
}

function buildCompQuery(item) {
  return [
    item.publication,
    item.coverSubject,
    'magazine'
  ].filter(Boolean).join(' ');
}

router.post('/pricing/preview', async (req, res) => {
  try {
    const item = req.body.item || {};
    const compData = await fetchBrowseCompsForItem(item);

    const pricing = buildSmartPricing(item, {
      soldPrices: [],
      activePrices: compData.activePrices
    });

    return res.json({
      success: true,
      pricing,
      queries: compData.queries,
      listings: compData.listings.slice(0, 12),
      compSampleSize: compData.activePrices.length,
      enums: {
        conditionTypes: CONDITION_TYPES,
        packageStates: PACKAGE_STATES
      }
    });
  } catch (error) {
    console.error('pricing/preview error:', error.response?.data || error.message || error);
    return res.status(500).json({
      success: false,
      error: 'Failed to build pricing preview'
    });
  }
});

router.get('/items/:id/pricing', async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    const compData = await fetchBrowseCompsForItem(item);

    item.comps = {
      soldPrices: [],
      activePrices: compData.activePrices
    };

    const pricing = buildSmartPricing(item, item.comps);

    return res.json({
      success: true,
      item,
      pricing,
      queries: compData.queries,
      listings: compData.listings.slice(0, 12),
      compSampleSize: compData.activePrices.length
    });
  } catch (error) {
    console.error('items/:id/pricing error:', error.response?.data || error.message || error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get item pricing'
    });
  }
});

router.post('/items/:id/generate-ebay-draft', async (req, res) => {
  try {
    const baseItem = await getItemById(req.params.id);

    const item = {
      ...baseItem,
      ...(req.body.item || {})
    };

    const compData = await fetchBrowseCompsForItem(item);

    item.comps = {
      soldPrices: [],
      activePrices: compData.activePrices
    };

    const draft = generateEbayDraft(item, req.body.policies || {});

    return res.json({
      success: true,
      draft,
      queries: compData.queries,
      listings: compData.listings.slice(0, 12),
      compSampleSize: compData.activePrices.length
    });
  } catch (error) {
    console.error('generate-ebay-draft error:', error.response?.data || error.message || error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate eBay draft'
    });
  }
});

module.exports = router;
