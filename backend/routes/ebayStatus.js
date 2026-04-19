'use strict';

const express = require('express');
const router = express.Router();

router.get('/', async (_req, res) => {
  return res.json({
    success: true,
    connected: false,
    provider: 'ebay',
    status: 'pending_developer_approval',
    message: 'eBay developer account approval is still pending.'
  });
});

module.exports = router;
