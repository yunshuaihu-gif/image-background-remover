import React, { useState } from 'react'

function App() {
  const [images, setImages] = useState([])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      preview: URL.createObjectURL(file)
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Image Background Remover</h1>
      <p>Upload images to remove background</p>
      
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        style={{ margin: '20px 0' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {images.map(img => (
          <div key={img.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <img src={img.preview} alt={img.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            <div style={{ padding: '10px' }}>
              <p style={{ fontSize: '12px', margin: '0 0 10px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</p>
              <button onClick={() => removeImage(img.id)} style={{ width: '100%', padding: '5px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
