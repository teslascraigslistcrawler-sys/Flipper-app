const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const ENDPOINT = process.env.EBAY_NOTIFICATION_ENDPOINT || 'https://flipper-app.com/api/ebay/notification';
const VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN || '';

function buildChallengeResponse(challengeCode, verificationToken, endpoint) {
  return crypto
    .createHash('sha256')
    .update(challengeCode)
    .update(verificationToken)
    .update(endpoint)
    .digest('hex');
}

// eBay verification challenge
router.get('/notification', (req, res) => {
  const challengeCode = req.query.challenge_code;

  if (!challengeCode) {
    return res.status(400).json({ error: 'missing challenge_code' });
  }

  if (!VERIFICATION_TOKEN) {
    return res.status(500).json({ error: 'missing EBAY_VERIFICATION_TOKEN' });
  }

  const challengeResponse = buildChallengeResponse(
    String(challengeCode),
    String(VERIFICATION_TOKEN),
    String(ENDPOINT)
  );

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({ challengeResponse });
});

// eBay account deletion notifications
router.post('/notification', express.json({ type: '*/*' }), (req, res) => {
  console.log('eBay notification received:', JSON.stringify(req.body || {}, null, 2));
  return res.status(204).send();
});

module.exports = router;
