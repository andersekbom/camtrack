const CameraCard = ({ camera, onView, onEdit, onDelete }) => {
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image Section */}
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
        {hasImage ? (
          <img
            src={`http://localhost:3000/${primaryImage}`}
            alt={`${brand} ${model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
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
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No Image</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Camera Brand and Model */}
        <div className="font-semibold text-lg text-gray-900 mb-2">
          {brand} {model}
        </div>

      {/* Serial Number */}
      {serial && (
        <div className="text-sm text-gray-600 mb-3">
          Serial: {serial}
        </div>
      )}

      {/* Status Information */}
      <div className="flex gap-4 mb-3 text-sm">
        {mechanical_status && (
          <div className="text-gray-700">
            <span className="font-medium">Mechanical:</span> {mechanical_status}/5
          </div>
        )}
        {cosmetic_status && (
          <div className="text-gray-700">
            <span className="font-medium">Cosmetic:</span> {cosmetic_status}/5
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-lg font-bold text-green-600 mb-3">
        {formatPrice(weighted_price)}
      </div>

      {/* Comment */}
      {comment && (
        <div className="text-sm text-gray-600 italic border-t pt-3 mb-4">
          {comment}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onView(camera)}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          View
        </button>
        <button
          onClick={() => onEdit(camera)}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(camera)}
          className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete
        </button>
        </div>
      </div>
    </div>
  )
}

export default CameraCard