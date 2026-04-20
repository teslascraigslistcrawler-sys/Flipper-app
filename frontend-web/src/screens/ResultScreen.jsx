import React, { useState, useEffect } from 'react'

export default function ResultScreen({ navigate, imageData, result }) {
  const [buyPrice, setBuyPrice] = useState('')
  const [pricing, setPricing] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // clear any leftover media (fix ghost video)
    const videos = document.querySelectorAll('video')
    videos.forEach(v => {
      v.pause()
      v.src = ''
    })
  }, [])

  useEffect(() => {
    if (!result?.id) return

    setLoading(true)

    fetch(`/api/premium/items/${result.id}/pricing`)
      .then(res => res.json())
      .then(data => {
        setPricing(data.item?.pricing || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [result])

  const profit = pricing && buyPrice
    ? (pricing.recommendedBIN - parseFloat(buyPrice) - pricing.estimatedFeesAtBIN).toFixed(2)
    : null

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>Analysis</h2>

      {imageData && (
        <img src={imageData} alt="item" style={styles.image} />
      )}

      {loading && <p>Loading pricing...</p>}

      {pricing && (
        <div style={styles.card}>
          <p><b>Suggested Buy It Now:</b> ${pricing.recommendedBIN}</p>
          <p><b>Accept Offers Above:</b> ${pricing.recommendedAcceptMin}</p>
          <p><b>Estimated Fees:</b> ${pricing.estimatedFeesAtBIN}</p>
          <p><b>Shipping Suggestion:</b> ${pricing.shippingSuggested}</p>
        </div>
      )}

      <div style={styles.card}>
        <input
          type="number"
          placeholder="Enter your buy price"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          style={styles.input}
        />
        {profit && (
          <p style={styles.profit}>Estimated Profit: ${profit}</p>
        )}
      </div>

      <div style={styles.actions}>
        <button onClick={() => navigate('camera')} style={styles.btn}>
          Scan Another
        </button>

        <button
          onClick={() => navigate('lot')}
          style={styles.primary}
        >
          Add to Lot
        </button>
      </div>

    </div>
  )
}

const styles = {
  container: {
    padding: 16,
    color: '#fff',
    background: '#000',
    minHeight: '100vh'
  },
  title: {
    fontSize: 22,
    marginBottom: 12
  },
  image: {
    width: '100%',
    maxHeight: 250,
    objectFit: 'contain',
    marginBottom: 12
  },
  card: {
    background: '#111',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  input: {
    width: '100%',
    padding: 10,
    fontSize: 16,
    marginTop: 8
  },
  profit: {
    marginTop: 8,
    color: '#00ff88',
    fontWeight: 'bold'
  },
  actions: {
    display: 'flex',
    gap: 10
  },
  btn: {
    flex: 1,
    padding: 12
  },
  primary: {
    flex: 1,
    padding: 12,
    background: '#00ff88',
    border: 'none'
  }
}
