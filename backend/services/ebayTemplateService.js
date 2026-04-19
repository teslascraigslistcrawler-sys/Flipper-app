'use strict';

/**
 * ebayTemplateService.js
 *
 * Purpose:
 * - Build eBay-ready title
 * - Build description
 * - Build inventory payload
 * - Build offer payload
 * - Build one draft object for frontend review
 */

const {
  buildSmartPricing,
  displayConditionLabel,
  displayPackageLabel,
} = require('./pricingEngine');

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildEbayTitle(item = {}) {
  const parts = [
    item.publication,
    item.coverSubject,
    item.issueLabel,
    item.title,
    item.sealed ? 'SEALED' : '',
    item.packageState === 'original_sleeve' ? 'Original Sleeve' : '',
    item.itemCondition === 'new_unread' ? 'Unread' : '',
  ]
    .map(cleanText)
    .filter(Boolean);

  const title = parts.join(' ').replace(/\s+/g, ' ').trim();
  return title.slice(0, 80);
}

function buildMagazineSpecifics(item = {}) {
  const aspects = {
    Publication: [item.publication || 'Unknown'],
    Type: ['Magazine'],
    Condition: [displayConditionLabel(item.itemCondition || item.condition || 'very_good')],
  };

  if (item.coverSubject) aspects.Subject = [item.coverSubject];
  if (item.issueLabel) aspects['Issue Date'] = [item.issueLabel];
  if (item.packageState) aspects.Packaging = [displayPackageLabel(item.packageState)];
  if (item.language) aspects.Language = [item.language];
  if (item.genre) aspects.Genre = [item.genre];

  return aspects;
}

function buildEbayDescription(item = {}, pricing = null) {
  const safePricing = pricing || buildSmartPricing(item, item.comps || {});
  const lines = [
    'ITEM DETAILS',
    `Publication: ${item.publication || 'See photos'}`,
    `Cover Subject: ${item.coverSubject || 'See photos'}`,
    `Issue: ${item.issueLabel || 'See photos'}`,
    '',
    'CONDITION',
    `Item Condition: ${displayConditionLabel(item.itemCondition || item.condition || 'very_good')}`,
    `Packaging: ${displayPackageLabel(item.packageState || (item.sealed ? 'factory_sealed' : 'no_packaging'))}`,
    '- Original protective material included if shown in photos',
    '- Packaging may show light storage wear',
    '',
    'NOTES',
    '- From a private collection',
    '- Please review all photos carefully for exact condition and issue details',
    '- Stored carefully',
    '',
    'SHIPPING',
    '- Securely packaged',
    '- Ships promptly',
    '',
    'SUGGESTED MARKET DATA',
    `- Recommended Buy It Now: $${safePricing.recommendedBIN}`,
    `- Suggested offer floor: $${safePricing.recommendedAcceptMin}`,
  ];

  return lines.join('\n');
}

function buildInventoryItemPayload(item = {}, pricing = null) {
  const safePricing = pricing || buildSmartPricing(item, item.comps || {});

  return {
    sku: String(item.id),
    condition: 'NEW',
    product: {
      title: buildEbayTitle(item),
      description: buildEbayDescription(item, safePricing),
      aspects: buildMagazineSpecifics(item),
      imageUrls: Array.isArray(item.sourcePhotoUrls) ? item.sourcePhotoUrls : [],
    },
    availability: {
      shipToLocationAvailability: {
        quantity: Number(item.quantity || 1),
      },
    },
  };
}

function buildOfferPayload(item = {}, pricing = null, policies = {}) {
  const safePricing = pricing || buildSmartPricing(item, item.comps || {});
  const categoryId = String(item.ebayCategoryId || '280');

  return {
    sku: String(item.id),
    marketplaceId: 'EBAY_US',
    format: 'FIXED_PRICE',
    availableQuantity: Number(item.quantity || 1),
    categoryId,
    listingDescription: buildEbayDescription(item, safePricing),
    pricingSummary: {
      price: {
        value: String(safePricing.recommendedBIN),
        currency: 'USD',
      },
    },
    listingPolicies: {
      fulfillmentPolicyId: policies.fulfillmentPolicyId || process.env.EBAY_FULFILLMENT_POLICY_ID || '',
      paymentPolicyId: policies.paymentPolicyId || process.env.EBAY_PAYMENT_POLICY_ID || '',
      returnPolicyId: policies.returnPolicyId || process.env.EBAY_RETURN_POLICY_ID || '',
    },
  };
}

function generateEbayDraft(item = {}, policies = {}) {
  const pricing = buildSmartPricing(item, item.comps || {});
  const inventoryItem = buildInventoryItemPayload(item, pricing);
  const offer = buildOfferPayload(item, pricing, policies);

  return {
    title: inventoryItem.product.title,
    description: inventoryItem.product.description,
    pricing,
    inventoryItem,
    offer,
  };
}

module.exports = {
  buildEbayTitle,
  buildMagazineSpecifics,
  buildEbayDescription,
  buildInventoryItemPayload,
  buildOfferPayload,
  generateEbayDraft,
};
