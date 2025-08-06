import StarRating from './StarRating'

const CameraListItem = ({ camera, onView }) => {
  const {
    brand,
    model,
    serial,
    mechanical_status,
    cosmetic_status,
    weighted_price,
    comment,
    image1_path,
    image2_path,
    primary_image,
    has_user_images,
    image_source
  } = camera

  const formatPrice = (price) => {
    if (!price) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Use the enhanced image system - primary_image includes fallback logic
  const displayImage = primary_image || image1_path || image2_path
  const hasImage = displayImage !== null
  const isDefaultImage = !has_user_images && image_source !== 'user'
  
  // Build proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    
    // If it's a cached image or external URL, use as-is
    if (imagePath.startsWith('http') || imagePath.startsWith('/cached-images/')) {
      return imagePath
    }
    
    // For local uploads, add the base URL
    return imagePath.startsWith('/') ? `http://localhost:3000${imagePath}` : `http://localhost:3000/${imagePath}`
  }

  return (
    <div 
      onClick={() => onView(camera)}
      className="bg-white border border-gray-200 rounded hover:shadow-sm hover:border-blue-300 transition-all-smooth cursor-pointer"
    >
      <div className="px-4 py-2 flex items-center gap-3">
        {/* Compact Image */}
        <div className="relative w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
          {hasImage ? (
            <div className="relative w-full h-full">
              <img
                src={getImageUrl(displayImage)}
                alt={`${brand} ${model}`}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              {/* Small default image indicator */}
              {isDefaultImage && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white" title={`${image_source === 'default_model' ? 'Reference' : image_source === 'default_brand' ? 'Brand' : 'Placeholder'} image`}></div>
              )}
              {/* Fallback for failed image loads */}
              <div 
                className="hidden w-full h-full flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Main Content - Two Row Layout */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Brand/Model, Status, Price */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {brand} {model}
            </h3>
            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
              {/* Status Ratings */}
              <div className="flex items-center gap-3 text-xs">
                {mechanical_status && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">M:</span>
                    <StarRating rating={mechanical_status} size="small" />
                  </div>
                )}
                {cosmetic_status && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">C:</span>
                    <StarRating rating={cosmetic_status} size="small" />
                  </div>
                )}
              </div>
              {/* Price */}
              <div className="text-base font-bold text-green-600">
                {formatPrice(weighted_price)}
              </div>
            </div>
          </div>
          
          {/* Row 2: Serial and Comment */}
          {(serial || comment) && (
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              {serial && (
                <span className="truncate">Serial: {serial}</span>
              )}
              {comment && serial && <span className="text-gray-400">•</span>}
              {comment && (
                <span className="italic truncate flex-1">{comment}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CameraListItem