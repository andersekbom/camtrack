import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

// Mock API service
vi.mock('./services/api', () => ({
  getCameras: vi.fn(() => Promise.resolve([])),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  getSummary: vi.fn(() => Promise.resolve({
    total_cameras: 0,
    total_value_kamerastore: 0,
    total_value_weighted: 0,
    brand_distribution: []
  }))
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders CamTracker Deluxe header', async () => {
    render(<App />)
    
    await waitFor(() => {
      const header = screen.getByText(/CamTracker Deluxe/i)
      expect(header).toBeInTheDocument()
    })
  })
  
  test('renders action buttons in header', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/Add Camera/i)).toBeInTheDocument()
      expect(screen.getByText(/Summary/i)).toBeInTheDocument()
    })
  })

  test('renders mobile-responsive title', async () => {
    render(<App />)
    
    await waitFor(() => {
      // Desktop title
      expect(screen.getByText('CamTracker Deluxe')).toBeInTheDocument()
      // Mobile title (should be in DOM but hidden)
      expect(screen.getByText('CamTrack')).toBeInTheDocument()
    })
  })

  test('has proper dark mode support', async () => {
    render(<App />)
    
    await waitFor(() => {
      const appContainer = screen.getByText(/CamTracker Deluxe/i).closest('div')
      expect(appContainer).toHaveClass('transition-colors', 'duration-200')
    })
  })
})