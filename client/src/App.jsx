import { useState, useCallback } from 'react'
import './App.css'
import CameraList from './components/CameraList'
import CameraForm from './components/CameraForm'
import CameraDetail from './components/CameraDetail'
import ConfirmDialog from './components/ConfirmDialog'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import BrandFilter from './components/BrandFilter'
import ImportExport from './components/ImportExport'
import Summary from './components/Summary'
import DefaultImagesAdmin from './components/DefaultImagesAdmin'
import { createCamera, updateCamera, deleteCamera, clearAllCameras } from './services/api'

function App() {
  const [currentView, setCurrentView] = useState('list')
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cameraToDelete, setCameraToDelete] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedBrand, setSelectedBrand] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDefaultImagesAdmin, setShowDefaultImagesAdmin] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const handleAddCamera = () => {
    setSelectedCamera(null)
    setCurrentView('form')
  }

  const handleViewCamera = (camera) => {
    setSelectedCamera(camera)
    setCurrentView('detail')
  }

  const handleEditCamera = (camera) => {
    setSelectedCamera(camera)
    setCurrentView('form')
  }

  const handleDeleteCamera = (camera) => {
    setCameraToDelete(camera)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (cameraToDelete) {
      try {
        await deleteCamera(cameraToDelete.id)
        setRefreshTrigger(prev => prev + 1)
        setShowDeleteConfirm(false)
        setCameraToDelete(null)
        if (currentView === 'detail' && selectedCamera?.id === cameraToDelete.id) {
          setCurrentView('list')
        }
      } catch (error) {
        console.error('Failed to delete camera:', error)
        alert('Failed to delete camera. Please try again.')
      }
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setCameraToDelete(null)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCamera) {
        await updateCamera(selectedCamera.id, formData)
      } else {
        await createCamera(formData)
      }
      setRefreshTrigger(prev => prev + 1)
      setCurrentView('list')
      setSelectedCamera(null)
    } catch (error) {
      console.error('Failed to save camera:', error)
      throw error
    }
  }

  const handleFormCancel = () => {
    setCurrentView('list')
    setSelectedCamera(null)
  }

  const handleCloseDetail = () => {
    setCurrentView('list')
    setSelectedCamera(null)
  }

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
  }, [])

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  const handleToggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleToggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  }

  const handleBrandChange = useCallback((brand) => {
    setSelectedBrand(brand)
  }, [])

  const handleClearDatabase = () => {
    setShowClearConfirm(true)
  }

  const confirmClearDatabase = async () => {
    try {
      const result = await clearAllCameras()
      console.log('Clear database result:', result)
      setRefreshTrigger(prev => prev + 1)
      setShowClearConfirm(false)
      setSelectedBrand('') // Reset brand filter
      alert(`Database cleared successfully! Deleted ${result.deletedCount || 0} cameras.`)
    } catch (error) {
      console.error('Failed to clear database:', error)
      console.error('Error details:', error.response?.data)
      alert(`Failed to clear database: ${error.response?.data?.error || error.message}`)
    }
  }

  const cancelClearDatabase = () => {
    setShowClearConfirm(false)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
  }

  // Combine search and filters for API call
  const combinedFilters = {
    ...filters,
    search: searchTerm,
    brand: selectedBrand
  }

  const handleImportComplete = () => {
    // Refresh the camera list after import
    setRefreshTrigger(prev => prev + 1)
  }

  const handleViewSummary = () => {
    setCurrentView('summary')
  }


  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`shadow-sm border-b transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="hidden sm:inline">CamTracker Deluxe</span>
              <span className="sm:hidden">CamTrack</span>
            </h1>
            <div className="flex gap-2 sm:gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md transition-all-smooth focus:outline-none focus:ring-2 ${
                  darkMode
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600 focus:ring-yellow-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              {/* Dev/Testing Buttons - Only show in development */}
              <button
                onClick={() => setShowDefaultImagesAdmin(true)}
                className="px-2 py-2 sm:px-3 text-xs sm:text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all-smooth focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Default Images Admin"
              >
                <span className="hidden sm:inline">Images</span>
                <span className="sm:inline md:hidden">🖼️</span>
              </button>
              <button
                onClick={handleClearDatabase}
                className="px-2 py-2 sm:px-3 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-all-smooth focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Clear Database (Dev)"
              >
                <span className="hidden sm:inline">Clear DB</span>
                <span className="sm:inline md:hidden">🗑️</span>
              </button>
              <button
                onClick={handleViewSummary}
                className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all-smooth focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <span className="hidden sm:inline">Summary</span>
                <span className="sm:hidden">📊</span>
              </button>
              <button
                onClick={handleAddCamera}
                className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all-smooth focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="hidden sm:inline">Add Camera</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {currentView === 'list' && (
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <SearchBar 
                    onSearch={handleSearch} 
                    placeholder="Search by brand, model, or serial number..."
                    darkMode={darkMode}
                  />
                </div>
                {/* View Mode Toggle */}
                <div className={`flex border rounded-lg transition-colors duration-200 ${
                  darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-l-lg transition-all-smooth ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-r-lg transition-all-smooth ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title="List View"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <FilterPanel 
                onFiltersChange={handleFiltersChange}
                isOpen={showFilters}
                onToggle={handleToggleFilters}
              />
              <ImportExport onImportComplete={handleImportComplete} />
            </div>

            {/* Brand Filter */}
            <BrandFilter 
              selectedBrand={selectedBrand}
              onBrandChange={handleBrandChange}
              refreshTrigger={refreshTrigger}
              darkMode={darkMode}
            />
            
            {/* Camera List */}
            <CameraList 
              onView={handleViewCamera}
              onEdit={handleEditCamera}
              onDelete={handleDeleteCamera}
              refreshTrigger={refreshTrigger}
              filters={combinedFilters}
              viewMode={viewMode}
              darkMode={darkMode}
            />
          </div>
        )}

        {currentView === 'form' && (
          <CameraForm
            camera={selectedCamera}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isEdit={!!selectedCamera}
          />
        )}

        {currentView === 'detail' && selectedCamera && (
          <CameraDetail
            cameraId={selectedCamera.id}
            onEdit={handleEditCamera}
            onDelete={handleDeleteCamera}
            onClose={handleCloseDetail}
          />
        )}

        {currentView === 'summary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Collection Statistics</h2>
              <button
                onClick={() => setCurrentView('list')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Back to List
              </button>
            </div>
            <Summary refreshTrigger={refreshTrigger} />
          </div>
        )}

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Camera"
          message={`Are you sure you want to delete the ${cameraToDelete?.brand} ${cameraToDelete?.model}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDestructive={true}
        />

        <ConfirmDialog
          isOpen={showClearConfirm}
          title="Clear Database"
          message="Are you sure you want to delete ALL cameras from the database? This action cannot be undone and is intended for development/testing purposes only."
          confirmText="Clear All"
          cancelText="Cancel"
          onConfirm={confirmClearDatabase}
          onCancel={cancelClearDatabase}
          isDestructive={true}
        />

        {/* Default Images Admin Modal */}
        {showDefaultImagesAdmin && (
          <DefaultImagesAdmin
            onClose={() => setShowDefaultImagesAdmin(false)}
            darkMode={darkMode}
          />
        )}
      </main>
    </div>
  )
}

export default App