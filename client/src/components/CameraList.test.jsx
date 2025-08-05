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
  it('displays loading state initially', () => {
    vi.mocked(api.getCameras).mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<CameraList />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays empty state when no cameras exist', async () => {
    vi.mocked(api.getCameras).mockResolvedValue([])
    
    render(<CameraList />)
    
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
    
    render(<CameraList />)
    
    await waitFor(() => {
      expect(screen.getByText('Nikon F50')).toBeInTheDocument()
      expect(screen.getByText('Canon EOS')).toBeInTheDocument()
    })
  })

  it('displays error state when API call fails', async () => {
    vi.mocked(api.getCameras).mockRejectedValue(new Error('Network Error'))
    
    render(<CameraList />)
    
    await waitFor(() => {
      expect(screen.getByText(/error loading cameras/i)).toBeInTheDocument()
    })
  })

  it('fetches cameras on component mount', () => {
    vi.mocked(api.getCameras).mockResolvedValue([])
    
    render(<CameraList />)
    
    expect(api.getCameras).toHaveBeenCalledTimes(1)
  })
})