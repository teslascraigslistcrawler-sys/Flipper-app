const axios = require('axios');

async function analyzeImageWithVision(imageBuffer) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const base64Image = imageBuffer.toString('base64');

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            },
            {
              type: 'text',
              text: `You are an expert resale appraiser. Carefully examine this image and identify the exact item.

Look for:
- Any text, logos, brand names, model numbers stamped or printed on the item
- Physical characteristics: material, color, shape, size indicators
- Precious metals: look for hallmarks like 999, 24K, 1g, 1oz, PAMP, etc
- Electronics: look for model numbers, brand logos
- Collectibles: look for edition marks, serial numbers
- Clothing/shoes: look for tags, logos, style numbers

Be very specific. If you see a gold bar, identify the weight and purity. If you see a coin, identify it exactly.

Respond ONLY with valid JSON, no markdown:
{
  "labels": ["specific label 1", "specific label 2"],
  "brand": "exact brand or mint name or null",
  "model": "exact model, weight, edition or null",
  "category": "one of: smartphone, laptop, tablet, gaming console, video game, headphones, camera, smartwatch, television, speaker, keyboard, drone, jacket, sneakers, handbag, watch, sunglasses, toy, book, record, power tool, tools, kitchen appliance, bicycle, collectible, precious metal, jewelry, default",
  "webEntities": ["most likely product name"],
  "ocrText": ["any text visible"],
  "itemDescription": "one sentence describing exactly what this is"
}`
            }
          ]
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  const raw = response.data.choices[0].message.content.trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Could not parse OpenAI response as JSON');
    }
  }

  return {
    labelAnnotations: (parsed.labels || []).map(l => ({ description: l, score: 0.9 })),
    textAnnotations: (parsed.ocrText || []).map(t => ({ description: t })),
    logoAnnotations: parsed.brand ? [{ description: parsed.brand }] : [],
    webDetection: {
      webEntities: [
        ...(parsed.webEntities || []).map(e => ({ description: e, score: 0.85 })),
        ...(parsed.itemDescription ? [{ description: parsed.itemDescription, score: 0.95 }] : [])
      ]
    },
    localizedObjectAnnotations: [],
    _openaiCategory: parsed.category || null,
    _openaiModel: parsed.model || null,
  };
}

module.exports = { analyzeImageWithVision };
