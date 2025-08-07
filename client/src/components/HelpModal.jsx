import { useState, useEffect } from 'react'

function HelpModal({ isOpen, onClose, darkMode }) {
  const [helpMenu, setHelpMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchHelpMenu()
    }
  }, [isOpen])

  const fetchHelpMenu = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/help/menu')
      
      if (!response.ok) {
        throw new Error('Failed to load help menu')
      }
      
      const data = await response.json()
      setHelpMenu(data)
    } catch (err) {
      console.error('Failed to fetch help menu:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentClick = async (item) => {
    if (item.type === 'markdown') {
      // Open markdown content in new tab
      window.open(item.url, '_blank')
    } else if (item.type === 'external') {
      // Open external links in new tab
      window.open(item.url, '_blank')
    } else if (item.type === 'download') {
      // Handle download
      window.open(item.url, '_blank')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-lg shadow-xl ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              📖 Help & Documentation
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-md transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Loading help menu...
              </p>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'}`}>
                <div className="flex">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium">Error Loading Help</h3>
                    <p className="text-sm mt-1">{error}</p>
                    <button 
                      onClick={fetchHelpMenu}
                      className="text-sm underline mt-2 hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {helpMenu && !loading && !error && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{helpMenu.title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Choose from the resources below to get help with CamTracker Deluxe
                </p>
              </div>

              <div className="space-y-6">
                {helpMenu.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <h4 className="text-md font-medium mb-3">{section.title}</h4>
                    <div className="grid gap-3">
                      {section.items.map((item, itemIndex) => (
                        <button
                          key={itemIndex}
                          onClick={() => handleDocumentClick(item)}
                          className={`p-4 rounded-lg text-left transition-colors border ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-gray-500' 
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start">
                            <span className="text-2xl mr-3 mt-0.5">{item.icon}</span>
                            <div className="flex-1">
                              <h5 className="font-medium mb-1">{item.title}</h5>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {item.description}
                              </p>
                              <div className="flex items-center mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  item.type === 'markdown' 
                                    ? darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                                    : item.type === 'external'
                                    ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'
                                    : darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {item.type === 'markdown' ? 'Document' : 
                                   item.type === 'external' ? 'Interactive' : 'Download'}
                                </span>
                                <svg className="w-4 h-4 ml-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h4 className="font-medium mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quick Tips
                </h4>
                <ul className={`text-sm space-y-1 ml-7 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Start with the <strong>Quick Start Guide</strong> for basic setup</li>
                  <li>• Use the <strong>Complete User Guide</strong> for detailed features</li>
                  <li>• Check <strong>API Documentation</strong> for integration projects</li>
                  <li>• All links open in new tabs for easy reference</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HelpModal