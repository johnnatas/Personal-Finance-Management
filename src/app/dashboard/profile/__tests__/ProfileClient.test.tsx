import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileClient } from '../ProfileClient'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/infrastructure/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) }),
    auth: { updateUser: vi.fn().mockResolvedValue({ error: null }) },
  }),
}))
vi.mock('@/presentation/components/ui/Toast', () => ({ useToast: () => ({ showToast: vi.fn() }) }))

const mockUser = { id: 'user-1', email: 'test@example.com' }
const mockProfile = { id: 'user-1', name: 'João Silva', phone: '', currency: 'BRL', locale: 'pt-BR', timezone: 'America/Sao_Paulo', theme: 'auto' }

describe('ProfileClient', () => {
  it('renders profile tab by default', () => {
    render(<ProfileClient user={mockUser} profile={mockProfile} />)
    expect(screen.getByText('Dados Pessoais')).toBeInTheDocument()
    expect(screen.getByText('Alterar Senha')).toBeInTheDocument()
  })

  it('shows user email', () => {
    render(<ProfileClient user={mockUser} profile={mockProfile} />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('pre-fills name from profile', () => {
    render(<ProfileClient user={mockUser} profile={mockProfile} />)
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
  })

  it('switches to password tab on click', async () => {
    const user = userEvent.setup()
    render(<ProfileClient user={mockUser} profile={mockProfile} />)
    await user.click(screen.getByText('Alterar Senha'))
    expect(screen.getByText('Senha atual *')).toBeInTheDocument()
  })

  it('shows password mismatch error', async () => {
    const user = userEvent.setup()
    render(<ProfileClient user={mockUser} profile={mockProfile} />)
    await user.click(screen.getByText('Alterar Senha'))
    await user.type(screen.getByLabelText(/senha atual/i), 'Senha123!')
    await user.type(screen.getByLabelText(/nova senha/i), 'Nova123!')
    await user.type(screen.getByLabelText(/confirmar/i), 'Diferente123!')
    await user.click(screen.getByText('Alterar senha'))
    expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument()
  })
})
