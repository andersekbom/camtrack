import StarRating from './StarRating'

const CameraCard = ({ camera, onView, onEdit, onDelete, darkMode = false, priceType = 'weighted' }) => {
  const {
    brand,
    model,
    serial,
    mechanical_status,
    cosmetic_status,
    weighted_price,
    kamerastore_price,
    comment,
    image1_path,
    image2_path,
    primary_image,
    has_user_images,
    image_source,
    default_image_info
  } = camera

  // Select price based on priceType
  const displayPrice = priceType === 'kamerastore' ? kamerastore_price : weighted_price

  const formatPrice = (price) => {
    if (!price) return '0 kr'
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(price)
  }

  // Use the enhanced image system - primary_image includes fallback logic
  const displayImage = primary_image || image1_path || image2_path
  const hasImage = displayImage !== null
  const isDefaultImage = !has_user_images && image_source !== 'user'
  
  // Build proper image URL
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

  return (
    <div 
      onClick={() => onView(camera)}
      className={`rounded-lg shadow-md border hover-lift transition-all-smooth overflow-hidden cursor-pointer hover:shadow-lg ${
        darkMode 
          ? 'bg-gray-800 border-gray-600 hover:border-blue-500' 
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Image Section */}
      <div className={`relative w-full h-24 flex items-center justify-center ${
        darkMode ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        {hasImage ? (
          <div className="relative w-full h-full">
            <img
              src={getImageUrl(displayImage)}
              alt={`${brand} ${model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            {/* Default image indicator */}
            {isDefaultImage && (
              <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full opacity-75">
                {image_source === 'default_model' && 'REF'}
                {image_source === 'default_brand' && 'BRAND'}
                {image_source === 'placeholder' && 'PLACEHOLDER'}
              </div>
            )}
            {/* Fallback placeholder for failed image loads */}
            <div 
              className="hidden w-full h-full flex items-center justify-center"
              style={{ display: 'none' }}
            >
              <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                <svg className="mx-auto h-8 w-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">Image Failed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
            <svg className="mx-auto h-8 w-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">No Image</p>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3">
        {/* Camera Brand and Model */}
        <div className={`font-semibold text-base mb-2 transition-colors duration-200 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {brand} {model}
        </div>

      {/* Serial Number */}
      {serial && (
        <div className="text-sm text-gray-600 mb-3">
          Serial: {serial}
        </div>
      )}

      {/* Status Information */}
      <div className="space-y-2 mb-3 text-xs">
        {mechanical_status && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Mechanical:</span>
            <StarRating rating={mechanical_status} size="small" />
          </div>
        )}
        {cosmetic_status && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Cosmetic:</span>
            <StarRating rating={cosmetic_status} size="small" />
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-base font-bold text-green-600 mb-3">
        {formatPrice(displayPrice)}
      </div>

      {/* Comment */}
      {comment && (
        <div className="text-sm text-gray-600 italic border-t pt-3">
          {comment}
        </div>
      )}
      </div>
    </div>
  )
}

export default CameraCard