import { useState, useEffect } from 'react'

const DefaultImagesAdmin = ({ onClose, darkMode = false, inline = false }) => {
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
  const [populatingImages, setPopulatingImages] = useState(false)
  const [replacingImage, setReplacingImage] = useState(null)
  const [showReplaceFormFor, setShowReplaceFormFor] = useState(null)
  const [replaceData, setReplaceData] = useState({
    imageFile: null,
    source: 'Manual Upload',
    attribution: ''
  })

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

  const handlePopulateDefaultImages = async () => {
    if (!confirm('This will search for and add default images for all camera models without existing defaults. This may take several minutes. Continue?')) {
      return
    }

    try {
      setPopulatingImages(true)
      const response = await fetch('http://localhost:3000/api/jobs/populate-default-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dryRun: false,
          enableCaching: true,
          skipExisting: true,
          minQuality: 4,
          batchSize: 10,
          priority: 5
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start image population job')
      }

      const result = await response.json()
      alert(`Image population job started successfully! Job ID: ${result.jobId}\n\nThis will run in the background. Check the job status or refresh the page in a few minutes to see new images.`)
    } catch (err) {
      alert(`Error starting image population: ${err.message}`)
    } finally {
      setPopulatingImages(false)
    }
  }

  const handleReplaceImage = (id, brand, model) => {
    setShowReplaceFormFor(id)
    setReplaceData({
      imageFile: null,
      source: 'Manual Upload',
      attribution: ''
    })
  }

  const handleSubmitReplace = async (e, id, brand, model) => {
    e.preventDefault()
    
    if (!replaceData.imageFile) {
      alert('Please select an image file')
      return
    }

    try {
      setReplacingImage(id)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('defaultImage', replaceData.imageFile)
      formData.append('id', id)
      formData.append('source', replaceData.source)
      formData.append('attribution', replaceData.attribution)
      
      const response = await fetch('http://localhost:3000/api/default-images/replace-upload', {
        method: 'POST',
        body: formData // Don't set Content-Type header for FormData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to replace image')
      }

      const result = await response.json()
      alert(`Image replaced successfully for ${brand} ${model}!`)
      setShowReplaceFormFor(null)
      setReplaceData({
        imageFile: null,
        source: 'Manual Upload',
        attribution: ''
      })
      fetchDefaultImages()
    } catch (err) {
      alert(`Error replacing image: ${err.message}`)
    } finally {
      setReplacingImage(null)
    }
  }

  const handleCancelReplace = () => {
    setShowReplaceFormFor(null)
    setReplaceData({
      imageFile: null,
      source: 'Manual Upload',
      attribution: ''
    })
  }

  // Helper function to build proper image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    
    // If it's a Wikipedia URL, use our proxy to avoid CORS issues
    if (imagePath.includes('wikimedia.org') || imagePath.includes('wikipedia.org')) {
      return `http://localhost:3000/api/image-proxy?url=${encodeURIComponent(imagePath)}`
    }
    
    // If it's a cached image, use the local server
    if (imagePath.startsWith('/cached-images/')) {
      return `http://localhost:3000${imagePath}`
    }
    
    // For local uploads, add the base URL if needed
    return imagePath.startsWith('/') ? `http://localhost:3000${imagePath}` : imagePath
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
    if (inline) {
      return (
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6`}>
          <div className="text-center">Loading default images...</div>
        </div>
      )
    }
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
          <div className="text-center">Loading default images...</div>
        </div>
      </div>
    )
  }

  const content = (
    <>
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
        <button
          onClick={handlePopulateDefaultImages}
          disabled={populatingImages}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {populatingImages ? 'Starting...' : 'Re-run Image Generation'}
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
          <div key={image.id}>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg flex items-start gap-4`}>
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={getImageUrl(image.image_url)}
                  alt={`${image.brand} ${image.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                {/* Fallback for failed image loads */}
                <div className="hidden w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
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
              <div className="flex gap-2">
                <button
                  onClick={() => handleReplaceImage(image.id, image.brand, image.model)}
                  disabled={replacingImage === image.id}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  {replacingImage === image.id ? 'Replacing...' : 'Replace'}
                </button>
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Inline Replace Form */}
            {showReplaceFormFor === image.id && (
              <div className={`${darkMode ? 'bg-gray-600' : 'bg-yellow-50'} p-4 rounded-lg mt-2 border-2 border-yellow-300`}>
                <h4 className="text-md font-semibold mb-3">Replace Image for {image.brand} {image.model}</h4>
                <form onSubmit={(e) => handleSubmitReplace(e, image.id, image.brand, image.model)} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select New Image File *
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => setReplaceData(prev => ({ ...prev, imageFile: e.target.files[0] }))}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-500 text-white' 
                          : 'border-gray-300'
                      }`}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: JPEG, PNG (max 5MB)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Source
                      </label>
                      <input
                        type="text"
                        placeholder="Manual Upload"
                        value={replaceData.source}
                        onChange={(e) => setReplaceData(prev => ({ ...prev, source: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Attribution
                      </label>
                      <input
                        type="text"
                        placeholder="Image credit or attribution"
                        value={replaceData.attribution}
                        onChange={(e) => setReplaceData(prev => ({ ...prev, attribution: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-500 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={replacingImage === image.id}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                    >
                      {replacingImage === image.id ? 'Replacing...' : 'Replace Image'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelReplace}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}

        {filteredImages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {searchTerm ? 'No images found matching your search.' : 'No default images available.'}
          </div>
        )}
      </div>
    </>
  )

  if (inline) {
    return content
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Default Images Management</h2>
            <button
              onClick={onClose}
              className={`text-gray-500 hover:text-gray-700 text-2xl ${
                darkMode ? 'text-gray-400 hover:text-gray-200' : ''
              }`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {content}
        </div>
      </div>
    </div>
  )
}

export default DefaultImagesAdmin