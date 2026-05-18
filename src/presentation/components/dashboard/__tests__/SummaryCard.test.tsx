import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryCard } from '../SummaryCard'

describe('SummaryCard', () => {
  it('should render title and formatted amount', () => {
    render(<SummaryCard title="Receitas do Mês" amount={5000} variant="income" />)
    expect(screen.getByText('Receitas do Mês')).toBeInTheDocument()
    expect(screen.getByText(/5\.000,00/)).toBeInTheDocument()
  })

  it('should render positive change indicator', () => {
    render(<SummaryCard title="Saldo" amount={1000} variant="balance" change={10.5} />)
    expect(screen.getByText('+10.5% vs mês anterior')).toBeInTheDocument()
  })

  it('should render negative change indicator', () => {
    render(<SummaryCard title="Despesas" amount={800} variant="expense" change={-5.2} />)
    expect(screen.getByText('-5.2% vs mês anterior')).toBeInTheDocument()
  })

  it('should not render change when not provided', () => {
    render(<SummaryCard title="Saldo" amount={1000} variant="balance" />)
    expect(screen.queryByText(/vs mês anterior/)).not.toBeInTheDocument()
  })

  it('should render all variants without error', () => {
    const variants = ['income', 'expense', 'balance', 'savings'] as const
    variants.forEach(variant => {
      const { unmount } = render(<SummaryCard title="Test" amount={100} variant={variant} />)
      expect(screen.getAllByTestId('summary-card').length).toBeGreaterThan(0)
      unmount()
    })
  })
})
