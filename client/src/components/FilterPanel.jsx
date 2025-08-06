import { useState } from 'react'

const FilterPanel = ({ onFiltersChange, isOpen, onToggle }) => {
  const [mechanicalStatus, setMechanicalStatus] = useState([])
  const [cosmeticStatus, setCosmeticStatus] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const statusOptions = [
    { value: 1, label: '1 - Poor' },
    { value: 2, label: '2 - Fair' },
    { value: 3, label: '3 - Good' },
    { value: 4, label: '4 - Very Good' },
    { value: 5, label: '5 - Excellent' }
  ]

  const handleMechanicalStatusChange = (value) => {
    const newStatus = mechanicalStatus.includes(value)
      ? mechanicalStatus.filter(s => s !== value)
      : [...mechanicalStatus, value]
    
    setMechanicalStatus(newStatus)
    updateFilters({ mechanicalStatus: newStatus })
  }

  const handleCosmeticStatusChange = (value) => {
    const newStatus = cosmeticStatus.includes(value)
      ? cosmeticStatus.filter(s => s !== value)
      : [...cosmeticStatus, value]
    
    setCosmeticStatus(newStatus)
    updateFilters({ cosmeticStatus: newStatus })
  }

  const handlePriceChange = (type, value) => {
    if (type === 'min') {
      setMinPrice(value)
      updateFilters({ minPrice: value })
    } else {
      setMaxPrice(value)
      updateFilters({ maxPrice: value })
    }
  }

  const updateFilters = (updates) => {
    const currentFilters = {
      mechanicalStatus,
      cosmeticStatus,
      minPrice,
      maxPrice,
      ...updates
    }
    onFiltersChange(currentFilters)
  }

  const clearFilters = () => {
    setMechanicalStatus([])
    setCosmeticStatus([])
    setMinPrice('')
    setMaxPrice('')
    onFiltersChange({
      mechanicalStatus: [],
      cosmeticStatus: [],
      minPrice: '',
      maxPrice: ''
    })
  }

  const hasActiveFilters = mechanicalStatus.length > 0 || cosmeticStatus.length > 0 || minPrice || maxPrice

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
      >
        <div className="flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <svg 
          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Content */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {/* Mechanical Status Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Mechanical Condition</h3>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label key={`mechanical-${option.value}`} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={mechanicalStatus.includes(option.value)}
                      onChange={() => handleMechanicalStatusChange(option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cosmetic Status Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Cosmetic Condition</h3>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label key={`cosmetic-${option.value}`} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={cosmeticStatus.includes(option.value)}
                      onChange={() => handleCosmeticStatusChange(option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="md:col-span-2 lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="10"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    placeholder="No limit"
                    min="0"
                    step="10"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterPanel