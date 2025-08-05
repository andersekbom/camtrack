import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CameraList from './CameraList'
import * as api from '../services/api'

// Mock the API
vi.mock('../services/api')

describe('CameraList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  const defaultProps = {
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onCamerasUpdate: vi.fn(),
    refreshTrigger: 0
  }

  it('displays loading state initially', () => {
    vi.mocked(api.getCameras).mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<CameraList {...defaultProps} />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays empty state when no cameras exist', async () => {
    vi.mocked(api.getCameras).mockResolvedValue([])
    
    render(<CameraList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/no cameras yet/i)).toBeInTheDocument()
    })
  })

  it('displays list of cameras when data is loaded', async () => {
    const mockCameras = [
      { id: 1, brand: 'Nikon', model: 'F50', serial: '2922618' },
      { id: 2, brand: 'Canon', model: 'EOS', serial: '1234567' }
    ]
    
    vi.mocked(api.getCameras).mockResolvedValue(mockCameras)
    
    render(<CameraList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Nikon F50')).toBeInTheDocument()
      expect(screen.getByText('Canon EOS')).toBeInTheDocument()
    })
  })

  it('displays error state when API call fails', async () => {
    vi.mocked(api.getCameras).mockRejectedValue(new Error('Network Error'))
    
    render(<CameraList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/error loading cameras/i)).toBeInTheDocument()
    })
  })

  it('fetches cameras on component mount', () => {
    vi.mocked(api.getCameras).mockResolvedValue([])
    
    render(<CameraList {...defaultProps} />)
    
    expect(api.getCameras).toHaveBeenCalledTimes(1)
  })

  it('calls onCamerasUpdate when cameras are loaded', async () => {
    const mockCameras = [
      { id: 1, brand: 'Nikon', model: 'F50', serial: '2922618' }
    ]
    const mockOnCamerasUpdate = vi.fn()
    
    vi.mocked(api.getCameras).mockResolvedValue(mockCameras)
    
    render(<CameraList {...defaultProps} onCamerasUpdate={mockOnCamerasUpdate} />)
    
    await waitFor(() => {
      expect(mockOnCamerasUpdate).toHaveBeenCalledWith(mockCameras)
    })
  })

  it('refetches cameras when refreshTrigger changes', async () => {
    const { rerender } = render(<CameraList {...defaultProps} refreshTrigger={0} />)
    
    expect(api.getCameras).toHaveBeenCalledTimes(1)
    
    rerender(<CameraList {...defaultProps} refreshTrigger={1} />)
    
    expect(api.getCameras).toHaveBeenCalledTimes(2)
  })
})