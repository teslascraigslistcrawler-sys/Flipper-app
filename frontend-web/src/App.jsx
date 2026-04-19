import React, { useEffect, useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import CameraScreen from './screens/CameraScreen'
import PreviewScreen from './screens/PreviewScreen'
import ResultScreen from './screens/ResultScreen'
import LotScreen from './screens/LotScreen'
import ListingStudio from './components/ListingStudio'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [imageData, setImageData] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [lot, setLot] = useState([])

  useEffect(() => {
    const currentState = window.history.state

    if (!currentState || !currentState.screen) {
      window.history.replaceState({ screen: 'home' }, '', window.location.pathname)
    } else if (currentState.screen) {
      setScreen(currentState.screen)
    }

    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        setScreen(event.state.screen)
      } else {
        setScreen('home')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextScreen, data = {}) => {
    const state = { screen: nextScreen, ...data }
    window.history.pushState(state, '', window.location.pathname)
    setScreen(nextScreen)

    if (data.imageData !== undefined) setImageData(data.imageData)
    if (data.result !== undefined) setAnalysisResult(data.result)
  }

  const addToLot = (item) => {
    setLot(prev => [{ ...item, id: Date.now() }, ...prev])
  }

  const removeFromLot = (id) => {
    setLot(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {screen === 'home' && (
        <>
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
            <button
              onClick={() => navigate('listingStudio')}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Listing Studio
            </button>
          </div>
          <HomeScreen navigate={navigate} lotCount={lot.length} />
        </>
      )}

      {screen === 'camera' && (
        <CameraScreen navigate={navigate} lotCount={lot.length} />
      )}

      {screen === 'preview' && (
        <PreviewScreen navigate={navigate} imageData={imageData} />
      )}

      {screen === 'result' && (
        <ResultScreen
          navigate={navigate}
          imageData={imageData}
          result={analysisResult}
          addToLot={addToLot}
        />
      )}

      {screen === 'lot' && (
        <LotScreen
          navigate={navigate}
          lot={lot}
          removeFromLot={removeFromLot}
        />
      )}

      {screen === 'listingStudio' && (
        <div style={{ height: '100vh', overflowY: 'auto', background: '#f7f7f7' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <button
                onClick={() => navigate('home')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ← Back Home
              </button>
            </div>
            <ListingStudio />
          </div>
        </div>
      )}
    </div>
  )
}
