import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal } from '../ConfirmModal'

const baseProps = {
  isOpen: true,
  title: 'Excluir registro',
  message: 'Tem certeza que deseja excluir?',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('ConfirmModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<ConfirmModal {...baseProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal when isOpen is true', () => {
    render(<ConfirmModal {...baseProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Excluir registro')).toBeInTheDocument()
    expect(screen.getByText('Tem certeza que deseja excluir?')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal {...baseProps} onConfirm={onConfirm} />)
    await user.click(screen.getByText('Excluir'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal {...baseProps} onCancel={onCancel} />)
    await user.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when backdrop clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal {...baseProps} onCancel={onCancel} />)
    await user.click(screen.getByRole('dialog').previousElementSibling as HTMLElement)
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows custom labels', () => {
    render(<ConfirmModal {...baseProps} confirmLabel="Sim, remover" cancelLabel="Não, manter" />)
    expect(screen.getByText('Sim, remover')).toBeInTheDocument()
    expect(screen.getByText('Não, manter')).toBeInTheDocument()
  })

  it('applies danger variant styles by default', () => {
    render(<ConfirmModal {...baseProps} />)
    const confirmBtn = screen.getByText('Excluir')
    expect(confirmBtn.className).toContain('bg-red-600')
  })
})
