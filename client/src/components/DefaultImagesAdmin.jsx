import { useState, useEffect } from 'react'

const DefaultImagesAdmin = ({ onClose, darkMode = false }) => {
  const [defaultImages, setDefaultImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newImage, setNewImage] = useState({
    brand: '',
    model: '',
    imageUrl: '',
    source: 'Manual',
    attribution: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDefaultImages()
  }, [])

  const fetchDefaultImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/default-images')
      if (!response.ok) throw new Error('Failed to fetch default images')
      const data = await response.json()
      setDefaultImages(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddImage = async (e) => {
    e.preventDefault()
    if (!newImage.brand || !newImage.model || !newImage.imageUrl) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('http://localhost:3000/api/default-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newImage)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add image')
      }

      // Reset form and refresh list
      setNewImage({
        brand: '',
        model: '',
        imageUrl: '',
        source: 'Manual',
        attribution: ''
      })
      setShowAddForm(false)
      fetchDefaultImages()
    } catch (err) {
      alert(`Error adding image: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteImage = async (id) => {
    if (!confirm('Are you sure you want to delete this default image?')) return

    try {
      const response = await fetch(`http://localhost:3000/api/default-images/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete image')
      
      fetchDefaultImages()
    } catch (err) {
      alert(`Error deleting image: ${err.message}`)
    }
  }

  const handleSearchWikipedia = async (brand, model) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/image-search/search?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`
      )
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      if (data.images && data.images.length > 0) {
        const bestImage = data.images[0]
        setNewImage(prev => ({
          ...prev,
          brand: brand,
          model: model,
          imageUrl: bestImage.url,
          source: 'Wikipedia Commons',
          attribution: bestImage.attribution || `${bestImage.title} - ${bestImage.description_url}`
        }))
        setShowAddForm(true)
      } else {
        alert('No suitable images found for this camera model')
      }
    } catch (err) {
      alert(`Wikipedia search failed: ${err.message}`)
    }
  }

  const filteredImages = defaultImages.filter(img => 
    img.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
          <div className="text-center">Loading default images...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Default Images Management</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="mb-6 flex gap-4 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search by brand or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 min-w-64 px-3 py-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'border-gray-300'
              }`}
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showAddForm ? 'Cancel' : 'Add New Image'}
            </button>
            <button
              onClick={fetchDefaultImages}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Refresh
            </button>
          </div>

          {/* Add New Image Form */}
          {showAddForm && (
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
              <h3 className="text-lg font-semibold mb-4">Add New Default Image</h3>
              <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Brand *"
                  value={newImage.brand}
                  onChange={(e) => setNewImage(prev => ({ ...prev, brand: e.target.value }))}
                  className={`px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Model *"
                  value={newImage.model}
                  onChange={(e) => setNewImage(prev => ({ ...prev, model: e.target.value }))}
                  className={`px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  required
                />
                <input
                  type="url"
                  placeholder="Image URL *"
                  value={newImage.imageUrl}
                  onChange={(e) => setNewImage(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className={`px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Source"
                  value={newImage.source}
                  onChange={(e) => setNewImage(prev => ({ ...prev, source: e.target.value }))}
                  className={`px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Attribution"
                  value={newImage.attribution}
                  onChange={(e) => setNewImage(prev => ({ ...prev, attribution: e.target.value }))}
                  className={`px-3 py-2 border rounded-md md:col-span-1 ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
                <div className="md:col-span-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Image'}
                  </button>
                  {newImage.brand && newImage.model && (
                    <button
                      type="button"
                      onClick={() => handleSearchWikipedia(newImage.brand, newImage.model)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Search Wikipedia
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Images List */}
          <div className="space-y-4">
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Showing {filteredImages.length} of {defaultImages.length} default images
            </div>
            
            {filteredImages.map(image => (
              <div
                key={image.id}
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg flex items-start gap-4`}
              >
                <img
                  src={image.image_url}
                  alt={`${image.brand} ${image.model}`}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>'
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{image.brand} {image.model}</h4>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Source: {image.source}</div>
                    {image.source_attribution && (
                      <div>Attribution: {image.source_attribution}</div>
                    )}
                    {image.image_quality && (
                      <div>Quality: {image.image_quality}/10</div>
                    )}
                    <div>Created: {new Date(image.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}

            {filteredImages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? 'No images found matching your search.' : 'No default images available.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefaultImagesAdmin