import { useState, useEffect } from 'react'

const SearchBar = ({ onSearch, placeholder = "Search cameras...", darkMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Debounce search input to reduce API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, onSearch])

  const handleClear = () => {
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <div className="flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full pl-10 pr-10 py-2 border rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
              darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:placeholder-gray-300'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:placeholder-gray-400'
            }`}
            placeholder={placeholder}
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={handleClear}
                className={`focus:outline-none transition-colors duration-200 ${
                  darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      {searchTerm && (
        <div className={`absolute mt-1 text-sm transition-colors duration-200 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Searching for "{searchTerm}"...
        </div>
      )}
    </div>
  )
}

export default SearchBar