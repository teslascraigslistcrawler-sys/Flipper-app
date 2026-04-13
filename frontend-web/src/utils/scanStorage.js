const KEYS = {
  image: 'flipper:lastImage',
  result: 'flipper:lastResult',
  askingPrice: 'flipper:askingPrice',
};

export function saveImageData(imageDataUrl) {
  try {
    if (imageDataUrl) localStorage.setItem(KEYS.image, imageDataUrl);
  } catch (err) {
    console.error('saveImageData failed:', err);
  }
}

export function loadImageData() {
  try {
    return localStorage.getItem(KEYS.image) || '';
  } catch (err) {
    console.error('loadImageData failed:', err);
    return '';
  }
}

export function saveResult(result) {
  try {
    if (result) localStorage.setItem(KEYS.result, JSON.stringify(result));
  } catch (err) {
    console.error('saveResult failed:', err);
  }
}

export function loadResult() {
  try {
    const raw = localStorage.getItem(KEYS.result);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('loadResult failed:', err);
    return null;
  }
}

export function saveAskingPrice(value) {
  try {
    localStorage.setItem(KEYS.askingPrice, String(value ?? ''));
  } catch (err) {
    console.error('saveAskingPrice failed:', err);
  }
}

export function loadAskingPrice() {
  try {
    return localStorage.getItem(KEYS.askingPrice) || '';
  } catch (err) {
    console.error('loadAskingPrice failed:', err);
    return '';
  }
}

export function clearScanStorage() {
  try {
    localStorage.removeItem(KEYS.image);
    localStorage.removeItem(KEYS.result);
    localStorage.removeItem(KEYS.askingPrice);
  } catch (err) {
    console.error('clearScanStorage failed:', err);
  }
}
