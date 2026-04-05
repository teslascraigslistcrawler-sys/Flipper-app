/**
 * api.js — all network calls live here.
 * Use EXPO_PUBLIC_API_BASE_URL from .env
 */

const BASE_URL = 'http://157.245.182.211:3001/api';

/**
 * Analyze an item image.
 *
 * @param {string} imageUri - Local file URI from camera/gallery
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<ItemAnalysis>}
 */
export async function analyzeItemImage(imageUri, mimeType = 'image/jpeg') {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: mimeType,
    name: `item_${Date.now()}.jpg`,
  });

  const response = await fetch(`${BASE_URL}/analyze-item-image`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Health check — useful for connection debugging.
 */
export async function checkHealth() {
  const response = await fetch(`${BASE_URL.replace('/api', '')}/health`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return response.json();
}
