import { useState, useEffect } from 'react'
import { getCameras } from '../services/api'
import CameraCard from './CameraCard'
import CameraListItem from './CameraListItem'
import LoadingSpinner from './LoadingSpinner'

const CameraList = ({ onView, onEdit, onDelete, refreshTrigger, filters = {}, viewMode = 'grid', darkMode = false }) => {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const fetchCameras = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getCameras(filters, signal)
        setCameras(data)
      } catch (err) {
        if (!signal.aborted) setError(err.message)
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    fetchCameras()
    return () => {
      controller.abort()
    }
  }, [refreshTrigger, filters])

  if (loading) {
    return <LoadingSpinner text="Loading cameras..." />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">Error loading cameras: {error}</div>
      </div>
    )
  }

  if (cameras && cameras.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center py-8">
        <div className="text-gray-500">No cameras yet. Add your first camera!</div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div data-testid="camera-list" className="space-y-1">
        {cameras && cameras.map((camera, index) => (
          <div
            key={camera.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.02}s` }}
          >
            <CameraListItem 
              camera={camera} 
              onView={onView}
              darkMode={darkMode}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div data-testid="camera-list" className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {cameras && cameras.map((camera, index) => (
        <div
          key={camera.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CameraCard 
            camera={camera} 
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            darkMode={darkMode}
          />
        </div>
      ))}
    </div>
  )
}

export default CameraList
