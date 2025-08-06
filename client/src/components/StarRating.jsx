const StarRating = ({ rating, maxRating = 5, size = 'medium', showLabel = false, interactive = false, onChange }) => {
  const sizeClasses = {
    small: 'h-2 w-2',
    medium: 'h-3 w-3', 
    large: 'h-4 w-4'
  }

  const getStatusLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good', 
      4: 'Very Good',
      5: 'Excellent'
    }
    return labels[rating] || 'Not Rated'
  }

  const handleStarClick = (starRating) => {
    if (interactive && onChange) {
      onChange(starRating)
    }
  }

  return (
    <div className="flex items-center flex-shrink-0">
      <div className="flex gap-px items-center">
        {[...Array(maxRating)].map((_, index) => {
          const starRating = index + 1
          const isActive = starRating <= (rating || 0)
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(starRating)}
              disabled={!interactive}
              className={`${sizeClasses[size]} flex-shrink-0 ${
                interactive 
                  ? 'cursor-pointer hover:scale-110 transition-transform' 
                  : 'cursor-default'
              }`}
            >
              <svg
                className={`w-full h-full ${
                  isActive ? 'text-yellow-400' : 'text-gray-300'
                } ${interactive ? 'hover:text-yellow-300' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          )
        })}
      </div>
      
      {showLabel && (
        <span className="text-sm text-gray-600 ml-2">
          {getStatusLabel(rating)}
        </span>
      )}
      
      {!showLabel && rating && (
        <span className="text-sm text-gray-500 ml-1">
          ({rating}/{maxRating})
        </span>
      )}
    </div>
  )
}

export default StarRating