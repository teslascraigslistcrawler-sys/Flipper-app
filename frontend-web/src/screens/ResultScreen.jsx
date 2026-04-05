import React, { useState, useMemo } from 'react'
import { calcAll, fmt, sentiment } from '../utils/profit'

export default function ResultScreen({ navigate, imageData, result, addToLot }) {
  const [name, setName] = useState(result?.suggestedName || '')
  const [brand, setBrand] = useState(result?.possibleBrand || '')
  const [model, setModel] = useState(result?.possibleModel || '')
  const [buyPrice, setBuyPrice] = useState('')

  const { mid, fees, profit, roi } = useMemo(() => calcAll({
    low: result?.valueEstimateLow || 0,
    high: result?.valueEstimateHigh || 0,
    buyPrice: parseFloat(buyPrice) || 0
  }), [result, buyPrice])

  const sent = sentiment(profit, parseFloat(buyPrice))
  const sentColors = { good:'var(--profit)', ok:'var(--warning)', bad:'var(--loss)', neutral:'var(--text-secondary)' }
  const sentLabels = { good:'✓ GREAT FLIP', ok:'~ MARGINAL FLIP', bad:'✗ PASS ON THIS', neutral:'ESTIMATED PROFIT' }
  const color = sentColors[sent]

  const handleAdd = () => {
    const bp = parseFloat(buyPrice)
    if (!bp || bp <= 0) { alert('Enter your buy price first'); return }
    addToLot({ imageUrl: imageData?.url, name, brand, model, category: result?.category, buyPrice: bp, mid, fees, profit, roi })
    navigate('lot')
  }

  const searchEbay = () => {
    const q = encodeURIComponent(`${brand} ${name} resale`)
    window.open(`https://www.ebay.com/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1`, '_blank')
  }

  const conf = Math.round((result?.confidenceScore || 0) * 100)
  const confColor = conf >= 70 ? 'var(--profit)' : conf >= 40 ? 'var(--warning)' : 'var(--loss)'

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('camera')}>← Back</button>
        <span style={s.title}>Analysis</span>
        <button style={s.lotBtn} onClick={() => navigate('lot')}>📦 Lot</button>
      </div>

      <div style={s.scroll}>
        {/* Image */}
        <div style={s.imageWrap}>
          <img src={imageData?.url} style={s.image} alt="item" />
          <div style={s.catChip}>{result?.category}</div>
        </div>

        {/* Confidence */}
        <div style={s.card}>
          <div style={s.row}>
            <span style={s.label}>AI Confidence{result?._isMock ? ' (Demo)' : ''}</span>
            <span style={{...s.label, color: confColor, fontWeight:700}}>{conf}%</span>
          </div>
          <div style={s.track}><div style={{...s.fill, width:`${conf}%`, background: confColor}} /></div>
          {result?._isMock && <p style={s.mockNote}>Demo data — add Vision API key for real results</p>}
        </div>

        {/* Editable fields */}
        <div style={s.card}>
          <p style={s.sectionLabel}>ITEM DETAILS</p>
          <Field label="Item Name" value={name} onChange={setName} />
          <Field label="Brand" value={brand} onChange={setBrand} />
          <Field label="Model" value={model} onChange={setModel} />
        </div>

        {/* Value range */}
        <div style={s.card}>
          <p style={s.sectionLabel}>ESTIMATED RESALE VALUE</p>
          <div style={s.rangeRow}>
            <div><p style={s.rangeLabel}>LOW</p><p style={s.rangeValue}>{fmt(result?.valueEstimateLow)}</p></div>
            <div style={{textAlign:'center'}}><p style={{...s.rangeLabel, color:'var(--accent)'}}>MID</p><p style={{...s.rangeValue, color:'var(--accent)', fontSize:24}}>{fmt(mid)}</p></div>
            <div style={{textAlign:'right'}}><p style={s.rangeLabel}>HIGH</p><p style={s.rangeValue}>{fmt(result?.valueEstimateHigh)}</p></div>
          </div>
        </div>

        {/* Buy price */}
        <div style={s.card}>
          <p style={s.sectionLabel}>YOUR COST</p>
          <div style={s.inputRow}>
            <span style={s.prefix}>$</span>
            <input style={s.input} type="number" placeholder="0" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} inputMode="decimal" />
          </div>
        </div>

        {/* Fees */}
        <div style={s.feeRow}>
          <span style={s.feeLabel}>Est. Fees (13%)</span>
          <span style={s.feeValue}>{fmt(fees)}</span>
        </div>

        {/* Profit hero */}
        <div style={{...s.profitCard, borderColor: buyPrice ? color : 'var(--border)'}}>
          <p style={s.profitLabel}>{sentLabels[sent]}</p>
          <p style={{...s.profitValue, color}}>{buyPrice ? fmt(profit) : '—'}</p>
          {buyPrice && roi !== null && (
            <div style={{...s.roiBadge, background:`${color}22`}}>
              <span style={{color, fontSize:12, fontWeight:700}}>{roi >= 0 ? '+' : ''}{roi}% ROI</span>
            </div>
          )}
          {!buyPrice && <p style={s.hint}>Enter buy price to see profit</p>}
        </div>

        {/* eBay link */}
        <button style={s.ebayBtn} onClick={searchEbay}>
          🔍 Verify on eBay Sold Listings ↗
        </button>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.addBtn} onClick={handleAdd}>+ Add to Lot</button>
          <button style={s.scanBtn} onClick={() => navigate('camera')}>Scan Another</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div style={{marginBottom:12}}>
      <p style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4}}>{label}</p>
      <div style={{display:'flex', alignItems:'center', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px'}}>
        <input value={value} onChange={e => onChange(e.target.value)} style={{flex:1, background:'none', border:'none', color:'var(--text)', fontSize:15, fontWeight:600, outline:'none'}} />
        <span style={{fontSize:11, color:'var(--text-muted)'}}>✏</span>
      </div>
    </div>
  )
}

const s = {
  container: { height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'48px 16px 12px', background:'var(--bg)', borderBottom:'1px solid var(--border)' },
  backBtn: { background:'var(--surface-high)', border:'none', color:'var(--text)', padding:'8px 14px', borderRadius:20, cursor:'pointer', fontSize:14 },
  title: { color:'var(--text)', fontWeight:600, fontSize:16 },
  lotBtn: { background:'none', border:'none', color:'var(--accent)', fontSize:14, cursor:'pointer', fontWeight:600 },
  scroll: { flex:1, overflowY:'auto', padding:'16px 16px 120px' },
  imageWrap: { position:'relative', marginBottom:12 },
  image: { width:'100%', height:200, objectFit:'cover', borderRadius:12, background:'var(--surface-high)' },
  catChip: { position:'absolute', bottom:8, left:8, background:'rgba(10,10,15,0.8)', border:'1px solid var(--border)', borderRadius:20, padding:'4px 12px', fontSize:11, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.5 },
  card: { background:'var(--surface)', borderRadius:12, padding:16, marginBottom:12 },
  sectionLabel: { fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 },
  row: { display:'flex', justifyContent:'space-between', marginBottom:6 },
  label: { fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5 },
  track: { height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' },
  fill: { height:'100%', borderRadius:2, transition:'width 0.3s' },
  mockNote: { fontSize:11, color:'var(--warning)', marginTop:6 },
  rangeRow: { display:'flex', justifyContent:'space-between', alignItems:'flex-end' },
  rangeLabel: { fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:2 },
  rangeValue: { fontSize:18, fontWeight:700, color:'var(--text)' },
  inputRow: { display:'flex', alignItems:'center', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px' },
  prefix: { color:'var(--text-secondary)', fontSize:16, fontWeight:600, marginRight:4 },
  input: { flex:1, background:'none', border:'none', color:'var(--text)', fontSize:20, fontWeight:700, outline:'none' },
  feeRow: { display:'flex', justifyContent:'space-between', background:'var(--surface)', borderRadius:8, padding:'12px 16px', marginBottom:12 },
  feeLabel: { color:'var(--text-secondary)', fontSize:14 },
  feeValue: { color:'var(--text-secondary)', fontSize:14, fontWeight:600 },
  profitCard: { border:'1px solid', borderRadius:16, padding:20, textAlign:'center', marginBottom:12, background:'var(--surface)' },
  profitLabel: { fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 },
  profitValue: { fontSize:52, fontWeight:800, letterSpacing:-2, marginBottom:8 },
  roiBadge: { display:'inline-block', borderRadius:20, padding:'4px 16px' },
  hint: { fontSize:11, color:'var(--text-muted)', marginTop:4 },
  ebayBtn: { width:'100%', background:'none', border:'none', color:'var(--accent)', fontSize:14, padding:'12px', cursor:'pointer', textDecoration:'underline', marginBottom:8 },
  actions: { display:'flex', gap:12 },
  addBtn: { flex:1, background:'var(--accent)', color:'#000', border:'none', borderRadius:12, padding:'18px', fontSize:16, fontWeight:700, cursor:'pointer' },
  scanBtn: { flex:1, background:'var(--surface-high)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:'18px', fontSize:16, cursor:'pointer' },
}
