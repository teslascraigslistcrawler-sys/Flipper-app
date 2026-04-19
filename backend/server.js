'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const analyzeRoute = require('./routes/analyze');
const errorHandler = require('./middleware/errorHandler');
const premiumRoutes = require('./routes/premium');
const listingDraftRoutes = require('./routes/listingDraft');
const ebayStatusRoutes = require('./routes/ebayStatus');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Routes
app.use('/api', analyzeRoute);
app.use('/api/premium', premiumRoutes);
app.use('/api/listing-draft', listingDraftRoutes);
app.use('/api/ebay-status', ebayStatusRoutes);
app.use('/api/export', exportRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Flipper API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

module.exports = app;
