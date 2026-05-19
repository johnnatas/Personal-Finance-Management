import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionsClient } from '../TransactionsClient'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/presentation/hooks/useTransactions', () => ({
  useTransactions: () => ({ transactions: [], loading: false, error: null, refetch: vi.fn() }),
}))

vi.mock('@/infrastructure/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from: () => ({ insert: vi.fn().mockResolvedValue({ error: null }) }),
  }),
}))

const accounts = [{ id: 'acc-1', name: 'Conta', type: 'checking_account', current_balance: 1000, currency: 'BRL', color: '#3B82F6', isActive: true, currentBalance: 1000 }]
const categories = [{ id: 'cat-1', name: 'Alimentação', type: 'expense', color: '#EF4444', icon: 'utensils' }]

describe('TransactionsClient', () => {
  it('shows empty state when no transactions', () => {
    render(<TransactionsClient initialAccounts={accounts} initialCategories={categories} />)
    expect(screen.getByText('Nenhuma transação neste período')).toBeInTheDocument()
  })

  it('shows form when clicking add button', async () => {
    const user = userEvent.setup()
    render(<TransactionsClient initialAccounts={accounts} initialCategories={categories} />)
    await user.click(screen.getByText('Nova Transação'))
    expect(screen.getByText('Nova Transação', { selector: 'h2' })).toBeInTheDocument()
  })

  it('shows search input and type filter', () => {
    render(<TransactionsClient initialAccounts={accounts} initialCategories={categories} />)
    expect(screen.getByPlaceholderText('Buscar transações...')).toBeInTheDocument()
    expect(screen.getByText('Todos os tipos')).toBeInTheDocument()
  })
})
