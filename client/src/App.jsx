import { useState, useCallback } from 'react'
import './App.css'
import CameraList from './components/CameraList'
import CameraForm from './components/CameraForm'
import CameraDetail from './components/CameraDetail'
import ConfirmDialog from './components/ConfirmDialog'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import { createCamera, updateCamera, deleteCamera } from './services/api'

function App() {
  const [currentView, setCurrentView] = useState('list')
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cameraToDelete, setCameraToDelete] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)

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

  // Combine search and filters for API call
  const combinedFilters = {
    ...filters,
    search: searchTerm
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Camera Collection Manager
            </h1>
            <button
              onClick={handleAddCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Camera
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <div className="space-y-4">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search by brand, model, or serial number..."
              />
              <FilterPanel 
                onFiltersChange={handleFiltersChange}
                isOpen={showFilters}
                onToggle={handleToggleFilters}
              />
            </div>
            
            {/* Camera List */}
            <CameraList 
              onView={handleViewCamera}
              onEdit={handleEditCamera}
              onDelete={handleDeleteCamera}
              refreshTrigger={refreshTrigger}
              filters={combinedFilters}
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
      </main>
    </div>
  )
}

export default App