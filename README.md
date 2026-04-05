# Flipper — Resale Intelligence App

A mobile app that helps resellers make fast, confident buying decisions. Scan an item, get an estimated resale value range, calculate profit after fees, and decide whether to flip it.

---

## App Flow

```
Camera Screen → Preview Screen → Result Screen → Lot Screen
     ↓               ↓                ↓              ↓
  Capture         Confirm          Edit fields    View all
  or pick         image            & buy price    saved items
```

---

## Project Structure

```
flipper/
├── backend/                    # Node.js + Express API
│   ├── routes/
│   │   └── analyze.js          # POST /api/analyze-item-image
│   ├── services/
│   │   ├── visionService.js    # Google Cloud Vision API calls
│   │   └── itemAnalysisService.js  # Parsing + value heuristics
│   ├── middleware/
│   │   ├── upload.js           # Multer memory storage
│   │   └── errorHandler.js     # Centralized error handler
│   ├── utils/
│   │   └── mockFallback.js     # Dev mode mock data
│   ├── server.js               # App entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # React Native + Expo
    ├── src/
    │   ├── screens/
    │   │   ├── CameraScreen.js     # Capture / gallery pick
    │   │   ├── PreviewScreen.js    # Confirm + trigger analysis
    │   │   ├── ResultScreen.js     # Analysis results + profit calc
    │   │   └── LotScreen.js        # Saved items list
    │   ├── components/
    │   │   ├── Button.js
    │   │   ├── EditableField.js
    │   │   ├── ProfitBadge.js      # Hero profit display
    │   │   ├── ValueRangeDisplay.js
    │   │   ├── ConfidenceBar.js
    │   │   ├── LotItemCard.js
    │   │   └── ScreenHeader.js
    │   ├── services/
    │   │   └── api.js              # All API calls
    │   ├── hooks/
    │   │   └── useAnalyzeItem.js   # Analysis state hook
    │   ├── context/
    │   │   └── LotContext.js       # Global lot state (useReducer)
    │   ├── utils/
    │   │   └── profitCalculator.js # Profit, ROI, fee logic
    │   └── theme/
    │       ├── colors.js
    │       ├── typography.js
    │       ├── spacing.js
    │       └── index.js
    ├── App.js
    ├── app.json
    ├── babel.config.js
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo`
- Expo Go app on your phone (iOS or Android)
- Google Cloud account (for Vision API)

---

## Setup

### 1. Google Cloud Vision API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Cloud Vision API**: APIs & Services → Enable APIs → search "Vision API"
4. Create credentials: APIs & Services → Credentials → Create API Key
5. (Recommended) Restrict the key to Cloud Vision API only

### 2. Backend Setup

```bash
cd flipper/backend
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `.env`:
```env
GOOGLE_CLOUD_VISION_API_KEY=your_actual_api_key_here
PORT=3001
NODE_ENV=development
```

Start the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3001`
Health check: `http://localhost:3001/health`

> **No API key?** The server automatically returns mock data in dev mode so you can test the full UI flow without a Vision API key.

### 3. Frontend Setup

```bash
cd flipper/frontend
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `.env` — set your machine's local IP (not localhost):
```env
# Find your IP: ifconfig | grep "inet " (Mac/Linux) or ipconfig (Windows)
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XXX:3001/api
```

> **Important**: Use your machine's LAN IP, not `localhost`. Your phone and computer must be on the same WiFi network.

Start Expo:
```bash
npm start
```

Scan the QR code with Expo Go on your phone.

---

## API Reference

### `POST /api/analyze-item-image`

**Request**: `multipart/form-data`
- `image` (File) — JPEG, PNG, WEBP, or HEIC, max 10MB

**Response**:
```json
{
  "suggestedName": "Apple iPhone 13",
  "possibleBrand": "Apple",
  "possibleModel": "iPhone 13",
  "category": "Smartphone",
  "confidenceScore": 0.85,
  "valueEstimateLow": 144,
  "valueEstimateHigh": 630,
  "suggestedSearchQuery": "Apple iPhone 13 resale value site:ebay.com",
  "_isMock": false
}
```

### `GET /health`

Returns server status and version.

---

## Profit Formula

```
valueEstimateMid = (valueEstimateLow + valueEstimateHigh) / 2
fees             = valueEstimateMid × 0.13
profit           = valueEstimateMid - buyPrice - fees
roi              = (profit / buyPrice) × 100
```

The 13% fee rate covers estimated eBay/marketplace fees + shipping.

---

## Value Estimation Logic

The backend uses a heuristic engine (no external pricing API in MVP):

1. **Category detection** — matches Vision labels/OCR/web entities against a keyword map (smartphone, sneakers, handbag, gaming console, etc.)
2. **Brand tier detection** — classifies detected brands into Tier 1 (luxury/high-demand), Tier 2 (mid-range), Tier 3 (budget)
3. **Range calculation** — applies brand multipliers to base category ranges
4. **Confidence scoring** — weighs label strength, logo detection, and web entity confidence

To integrate real pricing data (v2), replace `estimateValue()` in `itemAnalysisService.js` with calls to eBay Terapeak, PriceCharting, or a similar API.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLOUD_VISION_API_KEY` | Yes* | Google Cloud Vision API key |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | `development` or `production` |
| `ALLOWED_ORIGIN` | No | CORS origin (default: `*`) |

*Without this key, the server returns mock data automatically.

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Yes | Full API base URL including `/api` |

---

## Design Decisions

- **Dark theme** — optimized for use in dim environments (thrift stores, storage units)
- **Profit-first layout** — profit number is the largest, most prominent element on the result screen
- **Editable fields** — pencil icon signals that all detected values can be corrected
- **Offline fallback** — mock data keeps the dev loop fast without API costs
- **State-only lot** — items are stored in React context for MVP; swap for AsyncStorage or SQLite in v2

---

## v2 Roadmap

- [ ] Real pricing via eBay Terapeak or Algopix API
- [ ] AsyncStorage persistence for lot across sessions
- [ ] Barcode scanning (expo-barcode-scanner)
- [ ] Photo history / past scans
- [ ] Export lot to CSV
- [ ] Push notifications for price alerts
- [ ] User accounts + cloud sync
