import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Summary from './Summary'
import * as api from '../services/api'

// Mock the API
vi.mock('../services/api')

describe('Summary', () => {
  const mockSummaryData = {
    total_cameras: 3,
    total_value_kamerastore: 950,
    total_value_weighted: 850,
    total_value_sold: 840,
    average_mechanical_status: 4.0,
    average_cosmetic_status: 3.7,
    condition_distribution: {
      excellent: 1,
      very_good: 1,
      good: 1,
      fair: 0,
      poor: 0
    },
    brand_distribution: [
      { brand: 'Nikon', count: 2 },
      { brand: 'Canon', count: 1 }
    ]
  }

  const defaultProps = {
    onClose: vi.fn(),
    darkMode: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays loading state initially', () => {
    vi.mocked(api.getSummary).mockImplementation(() => new Promise(() => {}))
    
    render(<Summary {...defaultProps} />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays collection summary statistics', async () => {
    vi.mocked(api.getSummary).mockResolvedValue(mockSummaryData)
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Collection Summary')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument() // total cameras
      expect(screen.getByText('$950.00')).toBeInTheDocument() // kamerastore value
      expect(screen.getByText('$850.00')).toBeInTheDocument() // weighted value
      expect(screen.getByText('$840.00')).toBeInTheDocument() // sold value
    })
  })

  it('displays condition statistics', async () => {
    vi.mocked(api.getSummary).mockResolvedValue(mockSummaryData)
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Condition Overview')).toBeInTheDocument()
      expect(screen.getByText('4.0')).toBeInTheDocument() // avg mechanical
      expect(screen.getByText('3.7')).toBeInTheDocument() // avg cosmetic
    })
  })

  it('displays condition distribution', async () => {
    vi.mocked(api.getSummary).mockResolvedValue(mockSummaryData)
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Excellent: 1')).toBeInTheDocument()
      expect(screen.getByText('Very Good: 1')).toBeInTheDocument()
      expect(screen.getByText('Good: 1')).toBeInTheDocument()
      expect(screen.getByText('Fair: 0')).toBeInTheDocument()
      expect(screen.getByText('Poor: 0')).toBeInTheDocument()
    })
  })

  it('displays brand distribution', async () => {
    vi.mocked(api.getSummary).mockResolvedValue(mockSummaryData)
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Brand Distribution')).toBeInTheDocument()
      expect(screen.getByText('Nikon: 2')).toBeInTheDocument()
      expect(screen.getByText('Canon: 1')).toBeInTheDocument()
    })
  })

  it('displays error state when API call fails', async () => {
    vi.mocked(api.getSummary).mockRejectedValue(new Error('Network Error'))
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/error loading summary/i)).toBeInTheDocument()
    })
  })

  it('displays empty state message when no cameras exist', async () => {
    const emptySummary = {
      total_cameras: 0,
      total_value_kamerastore: 0,
      total_value_weighted: 0,
      total_value_sold: 0,
      average_mechanical_status: 0,
      average_cosmetic_status: 0,
      condition_distribution: {
        excellent: 0,
        very_good: 0,
        good: 0,
        fair: 0,
        poor: 0
      },
      brand_distribution: []
    }

    vi.mocked(api.getSummary).mockResolvedValue(emptySummary)
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/no cameras in your collection yet/i)).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', async () => {
    vi.mocked(api.getSummary).mockResolvedValue(mockSummaryData)
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      const closeButton = screen.getByText(/close/i)
      expect(closeButton).toBeInTheDocument()
    })

    const closeButton = screen.getByText(/close/i)
    closeButton.click()
    
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('applies dark mode styles when enabled', async () => {
    vi.mocked(api.getSummary).mockResolvedValue(mockSummaryData)
    
    render(<Summary {...defaultProps} darkMode={true} />)
    
    await waitFor(() => {
      const modal = screen.getByText('Collection Summary').closest('div').parentElement
      expect(modal).toHaveClass('bg-gray-800')
    })
  })

  it('calculates percentages for condition distribution', async () => {
    vi.mocked(api.getSummary).mockResolvedValue(mockSummaryData)
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      // With 3 total cameras and 1 excellent, that's 33.3%
      expect(screen.getByText('(33.3%)')).toBeInTheDocument()
    })
  })

  it('formats currency values correctly', async () => {
    const summaryWithDecimals = {
      ...mockSummaryData,
      total_value_kamerastore: 1234.56,
      total_value_weighted: 987.43,
      total_value_sold: 876.89
    }

    vi.mocked(api.getSummary).mockResolvedValue(summaryWithDecimals)
    
    render(<Summary {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('$1,234.56')).toBeInTheDocument()
      expect(screen.getByText('$987.43')).toBeInTheDocument()
      expect(screen.getByText('$876.89')).toBeInTheDocument()
    })
  })
})