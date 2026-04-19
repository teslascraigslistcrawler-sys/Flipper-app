import React, { useState } from 'react';

export default function ListingStudio() {
  const [itemId, setItemId] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listing, setListing] = useState(null);

  async function loadListing() {
    setLoading(true);
    setError('');
    setListing(null);

    try {
      const res = await fetch(`http://localhost:3001/api/export/items/${itemId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load listing');
      }

      setListing(data.export);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(String(text || ''));
      alert('Copied');
    } catch {
      alert('Copy failed');
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 16, fontFamily: 'Arial, sans-serif' }}>
      <h2>Flipper Listing Studio</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          placeholder="Item ID"
          style={{ padding: 10, minWidth: 180 }}
        />
        <button onClick={loadListing} disabled={loading} style={{ padding: '10px 16px' }}>
          {loading ? 'Loading...' : 'Generate Listing'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#ffe5e5', color: '#900', padding: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {listing && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 10 }}>
            <h3>Title</h3>
            <div style={{ whiteSpace: 'pre-wrap', marginBottom: 10 }}>{listing.title}</div>
            <button onClick={() => copyText(listing.title)}>Copy Title</button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 10 }}>
            <h3>Pricing</h3>
            <p><strong>Price:</strong> ${listing.price}</p>
            <p><strong>Accept Offers Above:</strong> ${listing.acceptMin}</p>
            <p><strong>Shipping:</strong> ${listing.shipping}</p>
            <p><strong>Profit:</strong> ${listing.profit}</p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 10 }}>
            <h3>Description</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 10 }}>
{listing.description}
            </pre>
            <button onClick={() => copyText(listing.description)}>Copy Description</button>
          </div>
        </div>
      )}
    </div>
  );
}
