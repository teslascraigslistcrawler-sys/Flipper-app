const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeImageWithVision } = require('../services/visionService');
const { parseVisionResponse } = require('../services/itemAnalysisService');
const { getMockFallback } = require('../utils/mockFallback');

/**
 * POST /api/analyze-item-image
 *
 * Accepts a multipart/form-data image upload.
 * Returns structured item analysis with value estimates.
 *
 * Body: multipart/form-data
 *   - image: File (required)
 *
 * Response: ItemAnalysis JSON
 */
router.post('/analyze-item-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided. Send as multipart/form-data with key "image".' });
    }

    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    // If no API key, return mock data (dev mode)
    if (!apiKey || apiKey === 'your_google_cloud_vision_api_key_here') {
      console.warn('[WARN] No Vision API key configured — returning mock data');
      const mock = getMockFallback();
      return res.json(mock);
    }

    // Call Vision API
    let visionResponse;
    try {
      visionResponse = await analyzeImageWithVision(req.file.buffer);
    } catch (visionErr) {
      console.error('[Vision API Error]', visionErr.message);
      // Graceful fallback to mock data on Vision failure
      const mock = getMockFallback();
      return res.json({ ...mock, _fallbackReason: visionErr.message });
    }

    // Parse and return
    const result = parseVisionResponse(visionResponse);
    return res.json(result);

  } catch (err) {
    next(err);
  }
});

module.exports = router;
