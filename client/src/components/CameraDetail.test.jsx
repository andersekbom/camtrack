import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CameraDetail from './CameraDetail'
import * as api from '../services/api'

vi.mock('../services/api')

describe('CameraDetail', () => {
  const mockCamera = {
    id: 1,
    brand: 'Canon',
    model: 'AE-1',
    serial: '123456',
    mechanical_status: 4,
    cosmetic_status: 3,
    kamerastore_price: 150.00,
    weighted_price: 135.00,
    sold_price: 120.00,
    comment: 'Great vintage camera in working condition',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }

  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    api.getCamera.mockImplementation(() => new Promise(() => {}))
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )
    
    expect(screen.getByText('Loading camera details...')).toBeInTheDocument()
  })

  it('displays camera details correctly', async () => {
    api.getCamera.mockResolvedValue(mockCamera)
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Canon AE-1')).toBeInTheDocument()
    })

    expect(screen.getByText('Serial: 123456')).toBeInTheDocument()
    expect(screen.getByText('4/5 - Very Good')).toBeInTheDocument()
    expect(screen.getByText('3/5 - Good')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument()
    expect(screen.getByText('$135.00')).toBeInTheDocument()
    expect(screen.getByText('$120.00')).toBeInTheDocument()
    expect(screen.getByText('Great vintage camera in working condition')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', async () => {
    const minimalCamera = {
      id: 1,
      brand: 'Canon',
      model: 'AE-1'
    }
    
    api.getCamera.mockResolvedValue(minimalCamera)
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Canon AE-1')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Not specified')).toHaveLength(2)
    expect(screen.getAllByText('$0.00')).toHaveLength(2)
    expect(screen.queryByText('Serial:')).not.toBeInTheDocument()
    expect(screen.queryByText('Notes')).not.toBeInTheDocument()
  })

  it('shows error state when API call fails', async () => {
    api.getCamera.mockRejectedValue(new Error('Failed to fetch camera'))
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Error loading camera: Failed to fetch camera')).toBeInTheDocument()
    })
  })

  it('calls onEdit when edit button is clicked', async () => {
    api.getCamera.mockResolvedValue(mockCamera)
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Canon AE-1')).toBeInTheDocument()
    })

    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onDelete when delete button is clicked', async () => {
    api.getCamera.mockResolvedValue(mockCamera)
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Canon AE-1')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onClose when close button is clicked', async () => {
    api.getCamera.mockResolvedValue(mockCamera)
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Canon AE-1')).toBeInTheDocument()
    })

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('displays correct status colors and text', async () => {
    const cameraWithDifferentStatuses = {
      ...mockCamera,
      mechanical_status: 1, // Poor - should be red
      cosmetic_status: 5    // Excellent - should be green
    }
    
    api.getCamera.mockResolvedValue(cameraWithDifferentStatuses)
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('1/5 - Poor')).toBeInTheDocument()
      expect(screen.getByText('5/5 - Excellent')).toBeInTheDocument()
    })
  })

  it('formats dates correctly', async () => {
    api.getCamera.mockResolvedValue(mockCamera)
    
    render(
      <CameraDetail 
        cameraId={1} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
        onClose={mockOnClose} 
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Added: /)).toBeInTheDocument()
      expect(screen.getByText(/Last updated: /)).toBeInTheDocument()
    })
  })
})