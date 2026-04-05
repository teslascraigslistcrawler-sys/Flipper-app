export async function analyzeImage(imageBlob) {
  const formData = new FormData()
  formData.append('image', imageBlob, 'item.jpg')

  const response = await fetch('/api/analyze-item-image', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Server error: ${response.status}`)
  }

  return response.json()
}
