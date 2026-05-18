import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionForm } from '../TransactionForm'

const mockAccounts = [
  { id: 'acc-1', name: 'Conta Corrente', type: 'checking_account', currentBalance: 1000, currency: 'BRL', color: '#3B82F6', isActive: true },
]
const mockCategories = [
  { id: 'cat-1', name: 'Alimentação', type: 'expense', color: '#EF4444', icon: 'utensils' },
]

describe('TransactionForm', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the transaction form', () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        categories={mockCategories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
  })

  it('should show validation error when amount is empty', async () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        categories={mockCategories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(await screen.findByText(/valor deve ser maior que zero/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should show validation error when description is empty', async () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        categories={mockCategories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )
    await userEvent.type(screen.getByLabelText(/valor/i), '100')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(await screen.findByText(/descrição é obrigatória/i)).toBeInTheDocument()
  })

  it('should call onSubmit with valid data', async () => {
    const user = userEvent.setup()
    render(
      <TransactionForm
        accounts={mockAccounts}
        categories={mockCategories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText(/valor/i), '150')
    await user.type(screen.getByLabelText(/descrição/i), 'Supermercado')
    await user.selectOptions(screen.getByLabelText(/conta/i), 'acc-1')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 150,
          description: 'Supermercado',
          accountId: 'acc-1',
        }),
        expect.anything(),
      )
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    render(
      <TransactionForm
        accounts={mockAccounts}
        categories={mockCategories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
