import React, { useState } from 'react'
import { analyzeImage } from '../services/api'

export default function PreviewScreen({ navigate, imageData }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeImage(imageData.blob)
      navigate('result', { result })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('camera')}>← Back</button>
        <span style={s.title}>Preview</span>
        <div style={{width:60}} />
      </div>

      <div style={s.imageWrap}>
        <img src={imageData?.url} alt="captured" style={s.image} />
        {loading && (
          <div style={s.overlay}>
            <div style={s.spinner} />
            <p style={s.loadingTitle}>Analyzing Item...</p>
            <p style={s.loadingSubtitle}>Reading labels, brand & value signals</p>
          </div>
        )}
      </div>

      <div style={s.sheet}>
        {error && <div style={s.errorBox}><p style={s.errorText}>⚠ {error}</p></div>}
        <button style={s.analyzeBtn} onClick={analyze} disabled={loading}>
          {loading ? 'Analyzing...' : '🔍 Analyze Item'}
        </button>
        <button style={s.retakeBtn} onClick={() => navigate('camera')} disabled={loading}>
          Retake Photo
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { height:'100vh', display:'flex', flexDirection:'column', background:'#000' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'48px 16px 12px', background:'rgba(0,0,0,0.8)' },
  backBtn: { background:'var(--surface-high)', border:'none', color:'var(--text)', padding:'8px 14px', borderRadius:20, cursor:'pointer', fontSize:14 },
  title: { color:'var(--text)', fontWeight:600, fontSize:16 },
  imageWrap: { flex:1, position:'relative', overflow:'hidden' },
  image: { width:'100%', height:'100%', objectFit:'contain' },
  overlay: { position:'absolute', inset:0, background:'rgba(10,10,15,0.85)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 },
  spinner: { width:48, height:48, border:'3px solid var(--border)', borderTop:'3px solid var(--accent)', borderRadius:'50%', animation:'spin 1s linear infinite' },
  loadingTitle: { color:'var(--text)', fontSize:18, fontWeight:700 },
  loadingSubtitle: { color:'var(--text-secondary)', fontSize:14, textAlign:'center', padding:'0 32px' },
  sheet: { background:'var(--surface)', borderRadius:'24px 24px 0 0', padding:'24px 16px 48px', display:'flex', flexDirection:'column', gap:12 },
  errorBox: { background:'rgba(255,77,106,0.12)', border:'1px solid rgba(255,77,106,0.3)', borderRadius:8, padding:12 },
  errorText: { color:'var(--loss)', fontSize:14 },
  analyzeBtn: { background:'var(--accent)', color:'#000', border:'none', borderRadius:12, padding:'18px', fontSize:17, fontWeight:700, cursor:'pointer', width:'100%' },
  retakeBtn: { background:'var(--surface-high)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:'14px', fontSize:15, cursor:'pointer', width:'100%' },
}
