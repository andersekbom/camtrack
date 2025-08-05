import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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

  it('displays camera brand and model', () => {
    render(<CameraCard camera={mockCamera} />)
    
    expect(screen.getByText('Nikon F50')).toBeInTheDocument()
  })

  it('displays serial number when present', () => {
    render(<CameraCard camera={mockCamera} />)
    
    expect(screen.getByText('Serial: 2922618')).toBeInTheDocument()
  })

  it('displays mechanical and cosmetic status', () => {
    render(<CameraCard camera={mockCamera} />)
    
    expect(screen.getByText('Mechanical:', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('5/5')).toBeInTheDocument()
    expect(screen.getByText('Cosmetic:', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('4/5')).toBeInTheDocument()
  })

  it('displays weighted price formatted as currency', () => {
    render(<CameraCard camera={mockCamera} />)
    
    expect(screen.getByText('$540.00')).toBeInTheDocument()
  })

  it('displays comment when present', () => {
    render(<CameraCard camera={mockCamera} />)
    
    expect(screen.getByText('Great condition camera')).toBeInTheDocument()
  })

  it('handles missing serial number gracefully', () => {
    const cameraNoSerial = { ...mockCamera, serial: null }
    
    render(<CameraCard camera={cameraNoSerial} />)
    
    expect(screen.queryByText(/serial/i)).not.toBeInTheDocument()
  })

  it('handles missing comment gracefully', () => {
    const cameraNoComment = { ...mockCamera, comment: null }
    
    render(<CameraCard camera={cameraNoComment} />)
    
    expect(screen.queryByText('Great condition camera')).not.toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    render(<CameraCard camera={mockCamera} />)
    
    const card = screen.getByText('Nikon F50').closest('div').parentElement
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md')
  })
})