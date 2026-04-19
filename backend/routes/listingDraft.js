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

router.get('/items/:id', async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    const draft = generateEbayDraft(item);

    return res.json({
      success: true,
      draft
    });
  } catch (error) {
    console.error('listing draft error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate listing draft'
    });
  }
});

module.exports = router;
