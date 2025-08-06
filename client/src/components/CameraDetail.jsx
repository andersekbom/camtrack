import { useState, useEffect } from 'react'
import { getCamera } from '../services/api'
import StarRating from './StarRating'

const CameraDetail = ({ cameraId, onEdit, onDelete, onClose, darkMode = false, isModal = false }) => {
  const [camera, setCamera] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCamera = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCamera(cameraId)
        setCamera(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (cameraId) {
      fetchCamera()
    }
  }, [cameraId])

  const formatPrice = (price) => {
    if (!price) return '0 kr'
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(price)
  }

  const getStatusText = (status) => {
    const statusMap = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    }
    return statusMap[status] || 'Not specified'
  }

  const getStatusColor = (status) => {
    const colorMap = {
      1: 'text-red-600',
      2: 'text-orange-600',
      3: 'text-yellow-600', 
      4: 'text-blue-600',
      5: 'text-green-600'
    }
    return colorMap[status] || 'text-gray-600'
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
    
    // For local uploads, add the base URL
    return imagePath.startsWith('/') ? `http://localhost:3000${imagePath}` : `http://localhost:3000/${imagePath}`
  }

  // Get image source type for display
  const getImageSourceLabel = (imageSource) => {
    const sourceMap = {
      'user': 'User Upload',
      'default_model': 'Reference Image', 
      'default_brand': 'Brand Reference',
      'placeholder': 'Placeholder'
    }
    return sourceMap[imageSource] || 'Unknown'
  }

  if (loading) {
    return (
      <div className={`${isModal ? '' : 'rounded-lg shadow-md'} p-6 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white'
      }`}>
        <div className="text-center py-8">
          <div className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Loading camera details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${isModal ? '' : 'rounded-lg shadow-md'} p-6 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white'
      }`}>
        <div className="text-center py-8">
          <div className={darkMode ? 'text-red-400' : 'text-red-500'}>Error loading camera: {error}</div>
          <button
            onClick={onClose}
            className={`mt-4 px-4 py-2 rounded-md transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!camera) {
    return (
      <div className={`${isModal ? '' : 'rounded-lg shadow-md'} p-6 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white'
      }`}>
        <div className="text-center py-8">
          <div className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Camera not found</div>
          <button
            onClick={onClose}
            className={`mt-4 px-4 py-2 rounded-md transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isModal ? '' : 'rounded-lg shadow-md'} p-6 ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white'
    }`}>
      {/* Header with actions */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={`text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {camera.brand} {camera.model}
          </h2>
          {camera.serial && (
            <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Serial: {camera.serial}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(camera)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(camera)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-500'
            }`}
          >
            {isModal ? '×' : 'Close'}
          </button>
        </div>
      </div>

      {/* Images Section */}
      <div className="mb-6">
        <h3 className={`text-xl font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>Images</h3>
        
        {/* User uploaded images */}
        {(camera.image1_path || camera.image2_path) && (
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">User Photos</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {camera.image1_path && (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(camera.image1_path)}
                    alt={`${camera.brand} ${camera.model} - User Image 1`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={(e) => {
                      const modal = document.createElement('div')
                      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer'
                      modal.innerHTML = `<img src="${e.target.src}" class="max-w-full max-h-full object-contain" />`
                      modal.onclick = () => document.body.removeChild(modal)
                      document.body.appendChild(modal)
                    }}
                  />
                </div>
              )}
              {camera.image2_path && (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(camera.image2_path)}
                    alt={`${camera.brand} ${camera.model} - User Image 2`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={(e) => {
                      const modal = document.createElement('div')
                      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer'
                      modal.innerHTML = `<img src="${e.target.src}" class="max-w-full max-h-full object-contain" />`
                      modal.onclick = () => document.body.removeChild(modal)
                      document.body.appendChild(modal)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Default/Reference images */}
        {camera.primary_image && !camera.has_user_images && (
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                camera.image_source === 'default_model' ? 'bg-blue-100 text-blue-800' :
                camera.image_source === 'default_brand' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getImageSourceLabel(camera.image_source)}
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                <img
                  src={getImageUrl(camera.primary_image)}
                  alt={`${camera.brand} ${camera.model} - ${getImageSourceLabel(camera.image_source)}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={(e) => {
                    const modal = document.createElement('div')
                    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer'
                    modal.innerHTML = `<img src="${e.target.src}" class="max-w-full max-h-full object-contain" />`
                    modal.onclick = () => document.body.removeChild(modal)
                    document.body.appendChild(modal)
                  }}
                />
              </div>
              
              {/* Secondary image if available */}
              {camera.secondary_image && (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(camera.secondary_image)}
                    alt={`${camera.brand} ${camera.model} - Secondary ${getImageSourceLabel(camera.image_source)}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={(e) => {
                      const modal = document.createElement('div')
                      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer'
                      modal.innerHTML = `<img src="${e.target.src}" class="max-w-full max-h-full object-contain" />`
                      modal.onclick = () => document.body.removeChild(modal)
                      document.body.appendChild(modal)
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Image attribution */}
            {camera.default_image_info && camera.default_image_info.attribution && (
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Source:</span> {camera.default_image_info.source}
                </div>
                {camera.default_image_info.attribution && (
                  <div className="mt-1">
                    <span className="font-medium">Attribution:</span> {camera.default_image_info.attribution}
                  </div>
                )}
                {camera.default_image_info.quality && (
                  <div className="mt-1">
                    <span className="font-medium">Quality:</span> {camera.default_image_info.quality}/10
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* No images fallback */}
        {!camera.primary_image && !camera.image1_path && !camera.image2_path && (
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center max-w-md">
            <div className="text-center text-gray-400">
              <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">No images available</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera details grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Condition Status */}
        <div className="space-y-4">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Condition</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Mechanical Status</div>
                <div className="flex items-center gap-3">
                  <StarRating rating={camera.mechanical_status} showLabel={true} />
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Cosmetic Status</div>
                <div className="flex items-center gap-3">
                  <StarRating rating={camera.cosmetic_status} showLabel={true} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="space-y-4">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pricing</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Kamerastore Price:</span>
              <span className="font-semibold">{formatPrice(camera.kamerastore_price)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Weighted Price:</span>
              <span className="font-semibold text-green-600">{formatPrice(camera.weighted_price)}</span>
            </div>
            
            {camera.sold_price && (
              <div className="flex justify-between border-t pt-3">
                <span className="text-sm font-medium text-gray-700">Sold Price:</span>
                <span className="font-semibold text-blue-600">{formatPrice(camera.sold_price)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment section */}
      {camera.comment && (
        <div className="mt-6">
          <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notes</h3>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{camera.comment}</p>
          </div>
        </div>
      )}

      {/* Additional metadata */}
      <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {camera.created_at && (
            <div>Added: {new Date(camera.created_at).toLocaleDateString()}</div>
          )}
          {camera.updated_at && camera.updated_at !== camera.created_at && (
            <div>Last updated: {new Date(camera.updated_at).toLocaleDateString()}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CameraDetail