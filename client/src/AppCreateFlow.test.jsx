import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import * as api from './services/api'

// Mock the API module
vi.mock('./services/api')

describe('Add camera flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

it('creates a new camera and refreshes the list', async () => {
    const initialCameras = []
    const newCamera = {
      id: 1,
      brand: 'TestBrand',
      model: 'TestModel',
      serial: 'XYZ',
      mechanical_status: 3,
      cosmetic_status: 4,
      kamerastore_price: 100.5,
      sold_price: null,
      comment: ''
    }
    const updatedCameras = [newCamera]

    vi.mocked(api.getCameras)
      .mockResolvedValueOnce(initialCameras)
      .mockResolvedValueOnce(updatedCameras)
    vi.mocked(api.createCamera).mockResolvedValue(newCamera)

    render(<App />)

    // Initial empty state
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    // Open the add-camera form via header button
    fireEvent.click(
      screen.getByRole(
        'button',
        { name: /Add Camera/i },
        { selector: 'button:not([type="submit"])' }
      )
    )
    expect(screen.getByText(/Add New Camera/i)).toBeInTheDocument()

    // Fill out and submit the form inside the displayed form element
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'TestBrand' } })
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'TestModel' } })
    fireEvent.change(screen.getByLabelText(/serial number/i), { target: { value: 'XYZ' } })
    fireEvent.change(screen.getByLabelText(/mechanical status/i), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/cosmetic status/i), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText(/kamerastore price/i), { target: { value: '100.5' } })
    fireEvent.change(screen.getByLabelText(/comment/i), { target: { value: '' } })

    const form = screen.getByTestId('camera-form')
    const submitBtn = within(form).getByRole('button', { name: /^Add Camera$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(api.createCamera).toHaveBeenCalledWith({
        brand: 'TestBrand',
        model: 'TestModel',
        serial: 'XYZ',
        mechanical_status: 3,
        cosmetic_status: 4,
        kamerastore_price: 100.5,
        sold_price: '',
        comment: ''
      })
    })
  })
})
