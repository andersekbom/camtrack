import { useState, useEffect } from 'react'
import { getCameras } from '../services/api'
import CameraCard from './CameraCard'

const CameraList = ({ onView, onEdit, onDelete, onCamerasUpdate, refreshTrigger }) => {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCameras()
        setCameras(data)
        if (onCamerasUpdate) {
          onCamerasUpdate(data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCameras()
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

  if (cameras.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No cameras yet. Add your first camera!</div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cameras.map((camera) => (
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