import { useState, useEffect } from 'react'
import { getCameras } from '../services/api'
import CameraCard from './CameraCard'

const CameraList = ({ onView, onEdit, onDelete, onCamerasUpdate, refreshTrigger }) => {
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
        const data = await getCameras(signal)
        setCameras(data)
        onCamerasUpdate?.(data)
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
  }, [refreshTrigger, onCamerasUpdate])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading cameras...</div>
      </div>
    )
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

  return (
    <div data-testid="camera-list" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cameras && cameras.map((camera) => (
        <CameraCard 
          key={camera.id} 
          camera={camera} 
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default CameraList
