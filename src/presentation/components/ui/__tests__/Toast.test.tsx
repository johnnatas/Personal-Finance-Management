import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from '../Toast'

function TestComponent({ message = 'Salvo com sucesso', type = 'success' as const }) {
  const { showToast } = useToast()
  return <button onClick={() => showToast(message, type)}>Mostrar toast</button>
}

describe('Toast', () => {
  it('does not show toast before trigger', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows success toast when triggered', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><TestComponent /></ToastProvider>)
    await user.click(screen.getByText('Mostrar toast'))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Salvo com sucesso')).toBeInTheDocument()
  })

  it('shows error toast', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><TestComponent message="Erro ao salvar" type="error" /></ToastProvider>)
    await user.click(screen.getByText('Mostrar toast'))
    expect(screen.getByText('Erro ao salvar')).toBeInTheDocument()
  })

  it('removes toast when X clicked', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><TestComponent /></ToastProvider>)
    await user.click(screen.getByText('Mostrar toast'))
    expect(screen.getByText('Salvo com sucesso')).toBeInTheDocument()
    const closeBtn = screen.getByRole('button', { name: '' })
    await user.click(closeBtn)
    expect(screen.queryByText('Salvo com sucesso')).not.toBeInTheDocument()
  })
})
