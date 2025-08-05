const CameraCard = ({ camera }) => {
  const {
    brand,
    model,
    serial,
    mechanical_status,
    cosmetic_status,
    weighted_price,
    comment
  } = camera

  const formatPrice = (price) => {
    if (!price) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
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
        <div className="text-sm text-gray-600 italic border-t pt-3">
          {comment}
        </div>
      )}
    </div>
  )
}

export default CameraCard