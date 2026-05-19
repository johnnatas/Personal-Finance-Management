'use client'

import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen, title, message,
  confirmLabel = 'Excluir', cancelLabel = 'Cancelar',
  variant = 'danger', onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(5,21,14,0.5)] backdrop-blur-md"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm rounded-3xl bg-[var(--color-surface)] p-6 shadow-2xl animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-[var(--color-fg-faint)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-fg)] transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`h-5 w-5 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--color-fg)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn btn-outline"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
