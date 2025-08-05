import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CameraCard from './CameraCard'

describe('CameraCard', () => {
  const mockCamera = {
    id: 1,
    brand: 'Nikon',
    model: 'F50',
    serial: '2922618',
    mechanical_status: 5,
    cosmetic_status: 4,
    weighted_price: 540,
    comment: 'Great condition camera'
  }

  const defaultProps = {
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays camera brand and model', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    expect(screen.getByText('Nikon F50')).toBeInTheDocument()
  })

  it('displays serial number when present', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    expect(screen.getByText('Serial: 2922618')).toBeInTheDocument()
  })

  it('displays mechanical and cosmetic status', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    expect(screen.getByText('Mechanical:', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('5/5')).toBeInTheDocument()
    expect(screen.getByText('Cosmetic:', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('4/5')).toBeInTheDocument()
  })

  it('displays weighted price formatted as currency', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    expect(screen.getByText('$540.00')).toBeInTheDocument()
  })

  it('displays comment when present', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    expect(screen.getByText('Great condition camera')).toBeInTheDocument()
  })

  it('displays action buttons', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onView when view button is clicked', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    const viewButton = screen.getByText('View')
    fireEvent.click(viewButton)
    
    expect(defaultProps.onView).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockCamera)
  })

  it('handles missing serial number gracefully', () => {
    const cameraNoSerial = { ...mockCamera, serial: null }
    
    render(<CameraCard camera={cameraNoSerial} {...defaultProps} />)
    
    expect(screen.queryByText(/serial/i)).not.toBeInTheDocument()
  })

  it('handles missing comment gracefully', () => {
    const cameraNoComment = { ...mockCamera, comment: null }
    
    render(<CameraCard camera={cameraNoComment} {...defaultProps} />)
    
    expect(screen.queryByText('Great condition camera')).not.toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    render(<CameraCard camera={mockCamera} {...defaultProps} />)
    
    const card = screen.getByText('Nikon F50').closest('div').parentElement
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md')
  })
})