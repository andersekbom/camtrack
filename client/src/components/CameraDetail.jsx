import { useState, useEffect } from 'react'
import { getCamera } from '../services/api'

const CameraDetail = ({ cameraId, onEdit, onDelete, onClose }) => {
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
    if (!price) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading camera details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500">Error loading camera: {error}</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!camera) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">Camera not found</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with actions */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {camera.brand} {camera.model}
          </h2>
          {camera.serial && (
            <p className="text-gray-600 mt-1">Serial: {camera.serial}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(camera)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(camera)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>

      {/* Images Section */}
      {(camera.image1_path || camera.image2_path) && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {camera.image1_path && (
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`http://localhost:3000/${camera.image1_path}`}
                  alt={`${camera.brand} ${camera.model} - Image 1`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={(e) => {
                    // Simple image modal - could be enhanced with a proper modal component
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
                  src={`http://localhost:3000/${camera.image2_path}`}
                  alt={`${camera.brand} ${camera.model} - Image 2`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={(e) => {
                    // Simple image modal - could be enhanced with a proper modal component
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

      {/* Camera details grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Condition Status */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Condition</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Mechanical Status</div>
                <div className={`text-lg font-semibold ${getStatusColor(camera.mechanical_status)}`}>
                  {camera.mechanical_status ? `${camera.mechanical_status}/5 - ${getStatusText(camera.mechanical_status)}` : 'Not specified'}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700">Cosmetic Status</div>
                <div className={`text-lg font-semibold ${getStatusColor(camera.cosmetic_status)}`}>
                  {camera.cosmetic_status ? `${camera.cosmetic_status}/5 - ${getStatusText(camera.cosmetic_status)}` : 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Pricing</h3>
          
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
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Notes</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{camera.comment}</p>
          </div>
        </div>
      )}

      {/* Additional metadata */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500 space-y-1">
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