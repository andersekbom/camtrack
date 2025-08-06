import StarRating from './StarRating'

const CameraCard = ({ camera, onView, onEdit, onDelete, darkMode = false }) => {
  const {
    brand,
    model,
    serial,
    mechanical_status,
    cosmetic_status,
    weighted_price,
    comment,
    image1_path,
    image2_path
  } = camera

  const formatPrice = (price) => {
    if (!price) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const primaryImage = image1_path || image2_path
  const hasImage = primaryImage !== null

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
      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
        {hasImage ? (
          <img
            src={`http://localhost:3000/${primaryImage}`}
            alt={`${brand} ${model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center ${hasImage ? 'hidden' : 'flex'}`}
          style={{ display: hasImage ? 'none' : 'flex' }}
        >
          <div className="text-center text-gray-400">
            <svg className="mx-auto h-8 w-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">No Image</p>
          </div>
        </div>
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
        {formatPrice(weighted_price)}
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