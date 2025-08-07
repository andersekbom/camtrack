import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  const defaultProps = {
    searchTerm: '',
    onSearchChange: vi.fn(),
    filters: {},
    onFiltersChange: vi.fn(),
    showFilters: false,
    onToggleFilters: vi.fn(),
    sortBy: 'date',
    sortOrder: 'desc',
    onSortChange: vi.fn(),
    viewMode: 'grid',
    onViewModeChange: vi.fn(),
    selectedBrand: '',
    onBrandChange: vi.fn(),
    priceType: 'weighted',
    onPriceTypeChange: vi.fn(),
    darkMode: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input', () => {
    render(<SearchBar {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search cameras/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('displays current search term', () => {
    render(<SearchBar {...defaultProps} searchTerm="Nikon" />)
    
    const searchInput = screen.getByDisplayValue('Nikon')
    expect(searchInput).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', async () => {
    render(<SearchBar {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search cameras/i)
    fireEvent.change(searchInput, { target: { value: 'Canon' } })
    
    // Should debounce the call
    await waitFor(() => {
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('Canon')
    }, { timeout: 500 })
  })

  it('renders filter toggle button', () => {
    render(<SearchBar {...defaultProps} />)
    
    const filterButton = screen.getByTitle(/toggle filters/i)
    expect(filterButton).toBeInTheDocument()
  })

  it('calls onToggleFilters when filter button is clicked', () => {
    render(<SearchBar {...defaultProps} />)
    
    const filterButton = screen.getByTitle(/toggle filters/i)
    fireEvent.click(filterButton)
    
    expect(defaultProps.onToggleFilters).toHaveBeenCalled()
  })

  it('renders sorting controls', () => {
    render(<SearchBar {...defaultProps} />)
    
    expect(screen.getByDisplayValue('date')).toBeInTheDocument()
    expect(screen.getByText(/newest first/i)).toBeInTheDocument()
  })

  it('calls onSortChange when sort option changes', () => {
    render(<SearchBar {...defaultProps} />)
    
    const sortSelect = screen.getByDisplayValue('date')
    fireEvent.change(sortSelect, { target: { value: 'brand' } })
    
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('brand')
  })

  it('renders view mode toggle buttons', () => {
    render(<SearchBar {...defaultProps} />)
    
    const gridButton = screen.getByTitle(/grid view/i)
    const listButton = screen.getByTitle(/list view/i)
    
    expect(gridButton).toBeInTheDocument()
    expect(listButton).toBeInTheDocument()
  })

  it('calls onViewModeChange when view mode is changed', () => {
    render(<SearchBar {...defaultProps} />)
    
    const listButton = screen.getByTitle(/list view/i)
    fireEvent.click(listButton)
    
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('list')
  })

  it('highlights active view mode', () => {
    render(<SearchBar {...defaultProps} viewMode="list" />)
    
    const listButton = screen.getByTitle(/list view/i)
    const gridButton = screen.getByTitle(/grid view/i)
    
    expect(listButton).toHaveClass('bg-blue-600', 'text-white')
    expect(gridButton).not.toHaveClass('bg-blue-600', 'text-white')
  })

  it('renders price type selector', () => {
    render(<SearchBar {...defaultProps} />)
    
    expect(screen.getByDisplayValue('weighted')).toBeInTheDocument()
  })

  it('calls onPriceTypeChange when price type changes', () => {
    render(<SearchBar {...defaultProps} />)
    
    const priceSelect = screen.getByDisplayValue('weighted')
    fireEvent.change(priceSelect, { target: { value: 'kamerastore' } })
    
    expect(defaultProps.onPriceTypeChange).toHaveBeenCalledWith('kamerastore')
  })

  it('applies dark mode styles when enabled', () => {
    render(<SearchBar {...defaultProps} darkMode={true} />)
    
    const searchInput = screen.getByPlaceholderText(/search cameras/i)
    expect(searchInput).toHaveClass('bg-gray-700', 'text-white')
  })

  it('debounces search input correctly', async () => {
    render(<SearchBar {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search cameras/i)
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 'N' } })
    fireEvent.change(searchInput, { target: { value: 'Ni' } })
    fireEvent.change(searchInput, { target: { value: 'Nik' } })
    fireEvent.change(searchInput, { target: { value: 'Nikon' } })
    
    // Should only call once after debounce
    await waitFor(() => {
      expect(defaultProps.onSearchChange).toHaveBeenCalledTimes(1)
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('Nikon')
    }, { timeout: 500 })
  })
})