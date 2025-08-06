import { useState } from 'react'
import ImportExport from './ImportExport'
import DefaultImagesAdmin from './DefaultImagesAdmin'

const AdminSettings = ({ onClose, darkMode = false, onImportComplete }) => {
  const [activeTab, setActiveTab] = useState('import-export')

  const tabs = [
    { id: 'import-export', label: 'Import / Export', icon: '📁' },
    { id: 'default-images', label: 'Default Images', icon: '🖼️' },
    { id: 'database', label: 'Database', icon: '🗄️' }
  ]

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to delete ALL cameras from the database? This action cannot be undone and is intended for development/testing purposes only.')) {
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/cameras/clear', {
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