import { useState, useEffect } from 'react'
import { getCameras } from '../services/api'

const BrandFilter = ({ selectedBrand, onBrandChange, refreshTrigger, darkMode = false }) => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const cameras = await getCameras()
        
        // Extract unique brands and sort them
        const uniqueBrands = [...new Set(cameras.map(camera => camera.brand))]
          .filter(brand => brand && brand.trim() !== '')
          .sort()
        
        setBrands(uniqueBrands)
      } catch (error) {
        console.error('Failed to fetch brands:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [refreshTrigger])

  const handleBrandClick = (brand) => {
    // Toggle brand selection - if already selected, deselect it
    if (selectedBrand === brand) {
      onBrandChange('')
    } else {
      onBrandChange(brand)
    }
  }

  const handleClearAll = () => {
    onBrandChange('')
  }

  if (loading) {
    return (
      <div className={`border rounded-lg p-3 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`animate-pulse h-4 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`animate-pulse h-6 w-20 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`animate-pulse h-6 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`animate-pulse h-6 w-18 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    )
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <div className={`border rounded-lg p-3 transition-colors duration-200 ${
      darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-sm font-medium mr-2 transition-colors duration-200 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>Brands:</span>
        
        {/* All Brands button */}
        <button
          onClick={handleClearAll}
          className={`px-3 py-1 text-sm rounded-full border transition-all-smooth ${
            !selectedBrand
              ? 'bg-blue-600 text-white border-blue-600'
              : darkMode
                ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          All
        </button>

        {/* Individual brand buttons */}
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => handleBrandClick(brand)}
            className={`px-3 py-1 text-sm rounded-full border transition-all-smooth ${
              selectedBrand === brand
                ? 'bg-blue-600 text-white border-blue-600'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  )
}

export default BrandFilter