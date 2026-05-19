import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CurrencyInput } from '../CurrencyInput'

describe('CurrencyInput', () => {
  it('renders with R$ prefix', () => {
    render(<CurrencyInput value="" onChange={vi.fn()} />)
    expect(screen.getByText('R$')).toBeInTheDocument()
  })

  it('displays formatted value from prop', () => {
    render(<CurrencyInput value="150.50" onChange={vi.fn()} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('150,50')
  })

  it('shows empty when value is empty', () => {
    render(<CurrencyInput value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('calls onChange with numeric string when typing', () => {
    const onChange = vi.fn()
    render(<CurrencyInput value="" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '10000' } })
    expect(onChange).toHaveBeenCalledWith('100.00')
  })

  it('calls onChange with empty string when cleared', () => {
    const onChange = vi.fn()
    render(<CurrencyInput value="100" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('formats 1234 digits as 12,34', () => {
    const onChange = vi.fn()
    render(<CurrencyInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1234' } })
    expect(onChange).toHaveBeenCalledWith('12.34')
  })
})
