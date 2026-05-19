import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreditCardsClient } from '../CreditCardsClient'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/infrastructure/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

const mockAccounts = [
  { id: 'acc-1', name: 'Conta Corrente', type: 'checking_account' },
]

describe('CreditCardsClient', () => {
  it('shows empty state when no cards', () => {
    render(<CreditCardsClient initialCards={[]} accounts={mockAccounts} />)
    expect(screen.getByText('Nenhum cartão cadastrado')).toBeInTheDocument()
    expect(screen.getByText(/Adicione seus cartões/)).toBeInTheDocument()
  })

  it('shows form when clicking CTA in empty state', async () => {
    const user = userEvent.setup()
    render(<CreditCardsClient initialCards={[]} accounts={mockAccounts} />)
    await user.click(screen.getByText('Adicionar Cartão'))
    expect(screen.getByText('Novo Cartão de Crédito')).toBeInTheDocument()
  })

  it('shows form when clicking header button', async () => {
    const user = userEvent.setup()
    render(<CreditCardsClient initialCards={[]} accounts={mockAccounts} />)
    await user.click(screen.getByText('Novo Cartão'))
    expect(screen.getByText('Novo Cartão de Crédito')).toBeInTheDocument()
  })

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup()
    render(<CreditCardsClient initialCards={[]} accounts={mockAccounts} />)
    await user.click(screen.getByText('Novo Cartão'))
    await user.type(screen.getByPlaceholderText('0,00'), '1000')
    await user.click(screen.getByText('Salvar Cartão'))
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
  })

  it('shows validation error when credit limit is missing', async () => {
    const user = userEvent.setup()
    render(<CreditCardsClient initialCards={[]} accounts={mockAccounts} />)
    await user.click(screen.getByText('Novo Cartão'))
    await user.type(screen.getByPlaceholderText('Ex: Nubank Roxinho'), 'Meu Cartão')
    await user.click(screen.getByText('Salvar Cartão'))
    expect(screen.getByText('Limite deve ser maior que zero')).toBeInTheDocument()
  })

  it('renders existing cards with correct data', () => {
    const cards = [{
      id: 'card-1', user_id: 'user-1', name: 'Cartão XP', flag: 'visa',
      last_four: '9999', credit_limit: 5000, current_bill: 1500,
      closing_day: 10, due_day: 17, color: '#8B5CF6',
      institution: 'XP Investimentos', is_active: true,
    }]
    render(<CreditCardsClient initialCards={cards} accounts={mockAccounts} />)
    expect(screen.getByText('Cartão XP')).toBeInTheDocument()
    expect(screen.getByText('XP Investimentos')).toBeInTheDocument()
    expect(screen.getByText(/Dia 10 \/ Dia 17/)).toBeInTheDocument()
    expect(screen.getByText(/9999/)).toBeInTheDocument()
  })

  it('cancels form and hides it', async () => {
    const user = userEvent.setup()
    render(<CreditCardsClient initialCards={[]} accounts={mockAccounts} />)
    await user.click(screen.getByText('Novo Cartão'))
    expect(screen.getByText('Novo Cartão de Crédito')).toBeInTheDocument()
    await user.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Novo Cartão de Crédito')).not.toBeInTheDocument()
  })
})
