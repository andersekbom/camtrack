import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CameraForm from './CameraForm'

describe('CameraForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<CameraForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    expect(screen.getByLabelText(/brand/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/serial number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mechanical status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cosmetic status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kamerastore price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sold price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument()
  })

  it('shows Add New Camera title by default', () => {
    render(<CameraForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    expect(screen.getByText('Add New Camera')).toBeInTheDocument()
    expect(screen.getByText('Add Camera')).toBeInTheDocument()
  })

  it('shows Edit Camera title when isEdit is true', () => {
    render(<CameraForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isEdit={true} />)
    
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
    expect(screen.getByText('Update Camera')).toBeInTheDocument()
  })

  it('pre-fills form with camera data when provided', () => {
    const camera = {
      brand: 'Canon',
      model: 'AE-1',
      serial: '123456',
      mechanical_status: 4,
      cosmetic_status: 3,
      kamerastore_price: 150.00,
      sold_price: 120.00,
      comment: 'Great condition'
    }

    render(<CameraForm camera={camera} onSubmit={mockOnSubmit} onCancel={mockOnCancel} isEdit={true} />)
    
    expect(screen.getByDisplayValue('Canon')).toBeInTheDocument()
    expect(screen.getByDisplayValue('AE-1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123456')).toBeInTheDocument()
    expect(screen.getByDisplayValue('4 - Very Good')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3 - Good')).toBeInTheDocument()
    expect(screen.getByDisplayValue('150')).toBeInTheDocument()
    expect(screen.getByDisplayValue('120')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Great condition')).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    render(<CameraForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByText('Add Camera')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Brand is required')).toBeInTheDocument()
      expect(screen.getByText('Model is required')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

it.skip('validates status ranges', async () => {
    render(<CameraForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Canon' } })
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'AE-1' } })
    
    // Test invalid mechanical status
    fireEvent.change(screen.getByLabelText(/mechanical status/i), { target: { value: '6' } })
    fireEvent.change(screen.getByLabelText(/cosmetic status/i), { target: { value: '0' } })
    
    const submitButton = screen.getByText('Add Camera')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/Mechanical status must be between 1 and 5/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Cosmetic status must be between 1 and 5/)
      ).toBeInTheDocument()
    })
  })

  it('submits form with correct data', async () => {
    mockOnSubmit.mockResolvedValue()
    
    render(<CameraForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Canon' } })
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'AE-1' } })
    fireEvent.change(screen.getByLabelText(/serial number/i), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText(/mechanical status/i), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText(/cosmetic status/i), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/kamerastore price/i), { target: { value: '150.50' } })
    fireEvent.change(screen.getByLabelText(/comment/i), { target: { value: 'Test comment' } })
    
    const submitButton = screen.getByText('Add Camera')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        brand: 'Canon',
        model: 'AE-1',
        serial: '123456',
        mechanical_status: 4,
        cosmetic_status: 3,
        kamerastore_price: 150.5,
        sold_price: '',
        comment: 'Test comment'
      })
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<CameraForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('disables submit button while submitting', async () => {
    const slowOnSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<CameraForm onSubmit={slowOnSubmit} onCancel={mockOnCancel} />)
    
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Canon' } })
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'AE-1' } })
    
    const submitButton = screen.getByText('Add Camera')
    fireEvent.click(submitButton)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    await waitFor(() => {
      expect(screen.getByText('Add Camera')).toBeInTheDocument()
    })
  })
})
