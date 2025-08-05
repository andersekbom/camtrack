import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConfirmDialog from './ConfirmDialog'

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Test Title"
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders with default button text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders with custom button text', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    expect(mockOnConfirm).toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('calls onCancel when backdrop is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const backdrop = document.querySelector('.bg-black')
    fireEvent.click(backdrop)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('applies destructive styling when isDestructive is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Camera"
        confirmText="Delete"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDestructive={true}
      />
    )

    const confirmButton = screen.getByText('Delete')
    expect(confirmButton).toHaveClass('bg-red-600')
  })

  it('applies default styling when isDestructive is false', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Save Changes"
        confirmText="Save"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDestructive={false}
      />
    )

    const confirmButton = screen.getByText('Save')
    expect(confirmButton).toHaveClass('bg-blue-600')
  })

  it('calls onCancel when Escape key is pressed', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('renders without title when not provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders without message when not provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})