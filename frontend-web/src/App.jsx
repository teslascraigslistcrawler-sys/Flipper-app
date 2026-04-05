import React, { useState } from 'react'
import CameraScreen from './screens/CameraScreen'
import PreviewScreen from './screens/PreviewScreen'
import ResultScreen from './screens/ResultScreen'
import LotScreen from './screens/LotScreen'

export default function App() {
  const [screen, setScreen] = useState('camera')
  const [imageData, setImageData] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [lot, setLot] = useState([])

  const navigate = (to, params = {}) => {
    if (params.imageData) setImageData(params.imageData)
    if (params.result) setAnalysisResult(params.result)
    setScreen(to)
  }

  const addToLot = (item) => {
    setLot(prev => [{ ...item, id: Date.now() }, ...prev])
  }

  const removeFromLot = (id) => {
    setLot(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {screen === 'camera' && (
        <CameraScreen navigate={navigate} lotCount={lot.length} />
      )}
      {screen === 'preview' && (
        <PreviewScreen navigate={navigate} imageData={imageData} />
      )}
      {screen === 'result' && (
        <ResultScreen navigate={navigate} imageData={imageData} result={analysisResult} addToLot={addToLot} />
      )}
      {screen === 'lot' && (
        <LotScreen navigate={navigate} lot={lot} removeFromLot={removeFromLot} />
      )}
    </div>
  )
}
