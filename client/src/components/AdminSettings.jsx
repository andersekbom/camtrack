import { useState } from 'react'
import ImportExport from './ImportExport'
import DefaultImagesAdmin from './DefaultImagesAdmin'
import { getFullApiUrl } from '../services/imageUtils'

const AdminSettings = ({ onClose, darkMode = false, onImportComplete }) => {
  const [activeTab, setActiveTab] = useState('import-export')

  const tabs = [
    { id: 'import-export', label: 'Import / Export', icon: '📁' },
    { id: 'default-images', label: 'Default Images', icon: '🖼️' },
    { id: 'api-docs', label: 'API Documentation', icon: '📖' },
    { id: 'database', label: 'Database', icon: '🗄️' }
  ]

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to delete ALL cameras from the database? This action cannot be undone and is intended for development/testing purposes only.')) {
      return
    }

    try {
      const response = await fetch(getFullApiUrl('/api/cameras/clear'), {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to clear database')
      
      const result = await response.json()
      alert(`Database cleared successfully! Deleted ${result.deletedCount || 0} cameras.`)
      
      // Trigger refresh in parent component
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Failed to clear database:', error)
      alert(`Failed to clear database: ${error.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold">Admin Settings</h2>
            </div>
            <button
              onClick={onClose}
              className={`text-gray-500 hover:text-gray-700 text-2xl transition-colors ${
                darkMode ? 'text-gray-400 hover:text-gray-200' : ''
              }`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`px-6 pt-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'import-export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Import cameras from CSV files or export your collection for backup or analysis.
                </p>
              </div>
              <ImportExport onImportComplete={onImportComplete} darkMode={darkMode} />
            </div>
          )}

          {activeTab === 'default-images' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Default Image System</h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage reference images for camera models. These images are displayed when users haven't uploaded their own photos.
                </p>
              </div>
              {/* Default Images Admin will be rendered inline */}
              <div className="border rounded-lg overflow-hidden">
                <DefaultImagesAdmin onClose={() => {}} darkMode={darkMode} inline={true} />
              </div>
            </div>
          )}

          {activeTab === 'api-docs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">API Documentation</h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Comprehensive API documentation for developers and integration purposes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interactive Swagger UI */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-200'} rounded-lg p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🚀</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Interactive API Explorer</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>Swagger UI</p>
                    </div>
                  </div>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                    Try out API endpoints directly in your browser with the interactive Swagger interface.
                  </p>
                  <a
                    href={getFullApiUrl('/api/docs')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    <span>Open API Explorer</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Alternative Redoc View */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} border ${darkMode ? 'border-gray-600' : 'border-green-200'} rounded-lg p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📚</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Documentation View</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>Redoc Format</p>
                    </div>
                  </div>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
                    Clean, readable documentation format optimized for browsing and reference.
                  </p>
                  <a
                    href={getFullApiUrl('/api/docs/redoc')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    <span>View Documentation</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <span>📥</span>
                  Download API Specification
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Download the OpenAPI specification in different formats for integration with other tools.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={getFullApiUrl('/api/docs/openapi.json')}
                    download="camtracker-api-spec.json"
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>📄</span>
                    <span>JSON Format</span>
                  </a>
                  <a
                    href={getFullApiUrl('/api/docs/openapi.yaml')}
                    download="camtracker-api-spec.yaml"
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>📝</span>
                    <span>YAML Format</span>
                  </a>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} border ${darkMode ? 'border-gray-600' : 'border-purple-200'} rounded-lg p-6`}>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <span>🧪</span>
                  Testing Resources
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-purple-700'}`}>
                  Additional resources for testing and developing with the CamTracker API.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-purple-700'}`}>
                      📮 Postman Collection
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-purple-100 text-purple-600'}`}>
                      Available in /postman/
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-purple-700'}`}>
                      🧪 Test Suite
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-purple-100 text-purple-600'}`}>
                      npm test
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-purple-700'}`}>
                      📊 Sample Data
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-purple-100 text-purple-600'}`}>
                      sample-cameras.csv
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Database Operations</h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Development and testing tools for database management. Use with caution.
                </p>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-red-50'} border ${darkMode ? 'border-gray-600' : 'border-red-200'} rounded-lg p-4`}>
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                  ⚠️ Danger Zone
                </h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-red-700'}`}>
                  These operations cannot be undone. Only use during development or testing.
                </p>
                <button
                  onClick={handleClearDatabase}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Clear All Cameras
                </button>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <h4 className="font-medium mb-2">Database Statistics</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  View collection statistics and database information in the Summary tab.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings