import React, { useRef, useState, useEffect, useCallback } from 'react'

export default function CameraScreen({ navigate, lotCount }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [facing, setFacing] = useState('environment')

  const startCamera = useCallback(async (facingMode = 'environment') => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
      setError(null)
    } catch (e) {
      setError('Camera access denied. Please allow camera access and refresh.')
    }
  }, [stream])

  useEffect(() => {
    startCamera('environment')
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [])

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      const url = canvas.toDataURL('image/jpeg', 0.85)
      navigate('preview', { imageData: { blob, url } })
    }, 'image/jpeg', 0.85)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    navigate('preview', { imageData: { blob: file, url } })
  }

  const flipCamera = () => {
    const next = facing === 'environment' ? 'user' : 'environment'
    setFacing(next)
    startCamera(next)
  }

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoRow}>
          <span style={s.logo}>FLIPPER</span>
          <span style={s.logoTag}>resale intel</span>
        </div>
        <button style={s.lotBtn} onClick={() => navigate('lot')}>
          <span>📦</span>
          {lotCount > 0 && <span style={s.badge}>{lotCount}</span>}
        </button>
      </div>

      {/* Camera */}
      {error ? (
        <div style={s.errorBox}>
          <div style={{fontSize:48}}>📷</div>
          <p style={{color:'var(--text-secondary)', textAlign:'center', marginTop:16}}>{error}</p>
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted style={s.video} />
      )}

      <canvas ref={canvasRef} style={{display:'none'}} />

      {/* Reticle */}
      <div style={s.reticleWrap}>
        <div style={s.reticle}>
          <div style={{...s.corner, top:0, left:0, borderTop:'3px solid var(--accent)', borderLeft:'3px solid var(--accent)'}} />
          <div style={{...s.corner, top:0, right:0, borderTop:'3px solid var(--accent)', borderRight:'3px solid var(--accent)'}} />
          <div style={{...s.corner, bottom:0, left:0, borderBottom:'3px solid var(--accent)', borderLeft:'3px solid var(--accent)'}} />
          <div style={{...s.corner, bottom:0, right:0, borderBottom:'3px solid var(--accent)', borderRight:'3px solid var(--accent)'}} />
        </div>
        <p style={s.hint}>Center the item in frame</p>
      </div>

      {/* Controls */}
      <div style={s.controls}>
        <button style={s.sideBtn} onClick={() => fileRef.current.click()}>
          <span style={{fontSize:26}}>🖼️</span>
          <span style={s.sideBtnLabel}>Gallery</span>
        </button>
        <button style={s.shutter} onClick={capture}>
          <div style={s.shutterInner} />
        </button>
        <button style={s.sideBtn} onClick={flipCamera}>
          <span style={{fontSize:26}}>🔄</span>
          <span style={s.sideBtnLabel}>Flip</span>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />
    </div>
  )
}

const s = {
  container: { position:'relative', height:'100vh', background:'#000', overflow:'hidden', display:'flex', flexDirection:'column' },
  header: { position:'absolute', top:0, left:0, right:0, zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'48px 20px 16px' },
  logoRow: { display:'flex', alignItems:'baseline', gap:6 },
  logo: { fontSize:20, fontWeight:900, color:'var(--accent)', letterSpacing:2 },
  logoTag: { fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1 },
  lotBtn: { position:'relative', background:'rgba(0,0,0,0.5)', border:'none', borderRadius:20, width:40, height:40, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  badge: { position:'absolute', top:4, right:4, background:'var(--accent)', color:'#000', borderRadius:8, fontSize:10, fontWeight:800, padding:'0 4px', minWidth:16, textAlign:'center' },
  video: { width:'100%', height:'100%', objectFit:'cover' },
  errorBox: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' },
  reticleWrap: { position:'absolute', top:0, left:0, right:0, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' },
  reticle: { width:260, height:260, position:'relative' },
  corner: { position:'absolute', width:22, height:22 },
  hint: { color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:16, letterSpacing:0.5 },
  controls: { position:'absolute', bottom:0, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 40px 48px' },
  sideBtn: { background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, width:64 },
  sideBtnLabel: { color:'var(--text-secondary)', fontSize:11 },
  shutter: { width:78, height:78, borderRadius:39, border:'4px solid #fff', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  shutterInner: { width:62, height:62, borderRadius:31, background:'#fff' },
}
