import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  test('renders Camera Collection header', () => {
    render(<App />)
    const header = screen.getByText(/Camera Collection/i)
    expect(header).toBeInTheDocument()
  })
  
  test('has proper styling classes', () => {
    render(<App />)
    const header = screen.getByText(/Camera Collection/i)
    expect(header).toHaveClass('text-3xl', 'font-bold')
  })
})