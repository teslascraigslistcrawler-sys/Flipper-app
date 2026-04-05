import React from 'react'
import { fmt } from '../utils/profit'

export default function LotScreen({ navigate, lot, removeFromLot }) {
  const totalInvested = lot.reduce((s, i) => s + (i.buyPrice || 0), 0)
  const totalValue = lot.reduce((s, i) => s + (i.mid || 0), 0)
  const totalProfit = lot.reduce((s, i) => s + (i.profit || 0), 0)
  const isPositive = totalProfit >= 0

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('camera')}>← Back</button>
        <span style={s.title}>My Lot ({lot.length})</span>
        {lot.length > 0 && (
          <button style={s.clearBtn} onClick={() => { if(confirm('Clear all items?')) lot.forEach(i => removeFromLot(i.id)) }}>Clear</button>
        )}
      </div>

      {lot.length > 0 && (
        <div style={s.summary}>
          <div style={s.summaryItem}>
            <p style={s.summaryLabel}>Invested</p>
            <p style={s.summaryValue}>{fmt(totalInvested)}</p>
          </div>
          <div style={s.divider} />
          <div style={s.summaryItem}>
            <p style={s.summaryLabel}>Est. Value</p>
            <p style={s.summaryValue}>{fmt(totalValue)}</p>
          </div>
          <div style={s.divider} />
          <div style={s.summaryItem}>
            <p style={s.summaryLabel}>Est. Profit</p>
            <p style={{...s.summaryValue, color: isPositive ? 'var(--profit)' : 'var(--loss)'}}>
              {isPositive ? '+' : ''}{fmt(totalProfit)}
            </p>
          </div>
        </div>
      )}

      <div style={s.scroll}>
        {lot.length === 0 ? (
          <div style={s.empty}>
            <div style={{fontSize:64}}>📦</div>
            <p style={s.emptyTitle}>Your lot is empty</p>
            <p style={s.emptySubtitle}>Scan items and add them to track your buying decisions.</p>
            <button style={s.scanBtn} onClick={() => navigate('camera')}>Scan First Item</button>
          </div>
        ) : (
          <>
            {lot.map(item => (
              <div key={item.id} style={s.card}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} style={s.thumb} alt="" />
                ) : (
                  <div style={s.thumbPlaceholder}>📦</div>
                )}
                <div style={s.info}>
                  <p style={s.itemName}>{item.name}</p>
                  <p style={s.itemMeta}>{item.brand} · {item.category}</p>
                  <div style={s.financials}>
                    <span style={s.paid}>Paid {fmt(item.buyPrice)}</span>
                    <span style={{...s.itemProfit, color: item.profit >= 0 ? 'var(--profit)' : 'var(--loss)'}}>
                      {item.profit >= 0 ? '+' : ''}{fmt(item.profit)}
                    </span>
                  </div>
                </div>
                <button style={s.removeBtn} onClick={() => removeFromLot(item.id)}>✕</button>
              </div>
            ))}
            <button style={s.scanMoreBtn} onClick={() => navigate('camera')}>+ Scan Another Item</button>
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  container: { height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'48px 16px 12px', borderBottom:'1px solid var(--border)' },
  backBtn: { background:'var(--surface-high)', border:'none', color:'var(--text)', padding:'8px 14px', borderRadius:20, cursor:'pointer', fontSize:14 },
  title: { color:'var(--text)', fontWeight:600, fontSize:16 },
  clearBtn: { background:'none', border:'none', color:'var(--loss)', fontSize:14, cursor:'pointer' },
  summary: { display:'flex', background:'var(--surface)', borderBottom:'1px solid var(--border)' },
  summaryItem: { flex:1, padding:'12px 0', textAlign:'center' },
  summaryLabel: { fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 },
  summaryValue: { fontSize:16, fontWeight:700, color:'var(--text)' },
  divider: { width:1, background:'var(--border)', margin:'8px 0' },
  scroll: { flex:1, overflowY:'auto', padding:16 },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, paddingTop:80 },
  emptyTitle: { fontSize:20, fontWeight:700, color:'var(--text)' },
  emptySubtitle: { fontSize:15, color:'var(--text-secondary)', textAlign:'center', maxWidth:280, lineHeight:1.5 },
  scanBtn: { background:'var(--accent)', color:'#000', border:'none', borderRadius:12, padding:'14px 32px', fontSize:15, fontWeight:700, cursor:'pointer', marginTop:8 },
  card: { display:'flex', alignItems:'center', background:'var(--surface)', borderRadius:12, padding:12, marginBottom:8, border:'1px solid var(--border)', gap:12 },
  thumb: { width:56, height:56, borderRadius:8, objectFit:'cover', background:'var(--surface-high)' },
  thumbPlaceholder: { width:56, height:56, borderRadius:8, background:'var(--surface-high)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 },
  info: { flex:1 },
  itemName: { fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:2 },
  itemMeta: { fontSize:11, color:'var(--text-secondary)', marginBottom:6 },
  financials: { display:'flex', gap:16, alignItems:'center' },
  paid: { fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5 },
  itemProfit: { fontSize:13, fontWeight:700 },
  removeBtn: { background:'none', border:'none', color:'var(--text-muted)', fontSize:18, cursor:'pointer', padding:4 },
  scanMoreBtn: { width:'100%', background:'var(--surface-high)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:'16px', fontSize:15, cursor:'pointer', marginTop:8 },
}
