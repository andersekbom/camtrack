import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import * as api from './services/api'

// Mock the API module
vi.mock('./services/api')

describe('Edit camera flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

it.skip('edits an existing camera and updates the list', async () => {
    const existingCamera = {
      id: 1,
      brand: 'OldBrand',
      model: 'OldModel',
      serial: 'ABC',
      mechanical_status: 2,
      cosmetic_status: 3,
      kamerastore_price: 50.0,
      sold_price: null,
      comment: ''
    }
    const updatedCamera = {
      ...existingCamera,
      brand: 'NewBrand',
      model: 'NewModel'
    }
    const initialList = [existingCamera]
    const updatedList = [updatedCamera]

    vi.mocked(api.getCameras)
      .mockResolvedValueOnce(initialList)
      .mockResolvedValueOnce(updatedList)
    vi.mocked(api.updateCamera).mockResolvedValue(updatedCamera)

    render(<App />)

    // Wait for initial list
    await waitFor(() => {
      expect(screen.getByText('OldBrand OldModel')).toBeInTheDocument()
    })

    // Click the Edit button for the camera card
    const [editBtn] = screen.getAllByRole('button', { name: /^Edit$/i })
    fireEvent.click(editBtn)
    
    // Form should appear with prefilled values
    expect(screen.getByLabelText(/brand/i)).toHaveValue('OldBrand')

    // Change fields
    fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'NewBrand' } })
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'NewModel' } })
    
    // Submit form
    const form = screen.getByTestId('camera-form')
    within(form).getByRole('button', { name: /Update Camera/i }).click()

    // Verify update API called
    await waitFor(() => {
      expect(api.updateCamera).toHaveBeenCalledWith(existingCamera.id, expect.objectContaining({
        brand: 'NewBrand',
        model: 'NewModel'
      }))
    })

    // Final list shows updated values
    await waitFor(() => {
      expect(screen.getByText('NewBrand NewModel')).toBeInTheDocument()
    })
  })
})
