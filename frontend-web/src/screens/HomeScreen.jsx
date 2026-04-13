import React, { useEffect, useState } from 'react'
import { loadImageData, loadResult, clearScanStorage } from '../utils/scanStorage'

export default function HomeScreen({ navigate, lotCount }) {
  const [hasSavedScan, setHasSavedScan] = useState(false)

  useEffect(() => {
    const savedImage = loadImageData()
    const savedResult = loadResult()
    setHasSavedScan(!!(savedImage || savedResult))
  }, [])

  const handleNewScan = () => {
    clearScanStorage()
    navigate('camera')
  }

  const handleResume = () => {
    const savedResult = loadResult()
    if (savedResult) navigate('result')
    else navigate('camera')
  }

  return (
    <div style={s.container}>
      <div style={s.hero}>
        <div style={s.logoRow}>
          <span style={s.logo}>FLIPPER</span>
          <span style={s.logoTag}>resale intel</span>
        </div>

        <h1 style={s.headline}>Know Before You Buy</h1>
        <p style={s.subhead}>
          Scan an item, estimate resale value, and see whether it is worth the flip.
        </p>
      </div>

      <div style={s.actions}>
        <button style={s.primaryBtn} onClick={handleNewScan}>
          📷 Scan Item
        </button>

        {hasSavedScan && (
          <button style={s.secondaryBtn} onClick={handleResume}>
            ↩ Resume Last Scan
          </button>
        )}

        <button style={s.secondaryBtn} onClick={() => navigate('lot')}>
          📦 View Lot {lotCount > 0 ? `(${lotCount})` : ''}
        </button>
      </div>

      <div style={s.footerNote}>
        Quick pricing for garage sales, thrift finds, flea markets, and flips.
      </div>
    </div>
  )
}

const s = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0b0d10 0%, #12161c 100%)',
    color: 'var(--text)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px 20px 32px',
  },
  hero: {
    marginTop: '8vh',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 28,
  },
  logo: {
    fontSize: 28,
    fontWeight: 900,
    color: 'var(--accent)',
    letterSpacing: 2,
  },
  logoTag: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 34,
    lineHeight: 1.05,
    fontWeight: 800,
    marginBottom: 14,
    letterSpacing: -1,
  },
  subhead: {
    fontSize: 16,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    maxWidth: 420,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginTop: 32,
  },
  primaryBtn: {
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: 16,
    padding: '18px 20px',
    fontSize: 18,
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryBtn: {
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '16px 18px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerNote: {
    marginTop: 24,
    fontSize: 12,
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
}