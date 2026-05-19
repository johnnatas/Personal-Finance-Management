'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CreditCard, Trash2, AlertCircle } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency } from '@/presentation/lib/utils'
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal'
import { Modal } from '@/presentation/components/ui/Modal'
import { CurrencyInput } from '@/presentation/components/ui/CurrencyInput'
import { useToast } from '@/presentation/components/ui/Toast'

const FLAGS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
  { value: 'hipercard', label: 'Hipercard' },
  { value: 'other', label: 'Outro' },
]

// Color → cc style variant
const COLORS: { value: string; variant: 'green' | 'lime' | 'dark' }[] = [
  { value: '#C5E4D3', variant: 'green' },
  { value: '#E8E4C8', variant: 'lime' },
  { value: '#3D5C4F', variant: 'dark' },
]

function colorVariant(color: string): 'green' | 'lime' | 'dark' {
  const found = COLORS.find(c => c.value.toLowerCase() === color.toLowerCase())
  if (found) return found.variant
  // Map legacy colors to variants
  const lower = color.toLowerCase()
  if (lower.startsWith('#8b5') || lower.startsWith('#6366') || lower.startsWith('#3d5')) return 'dark'
  if (lower.startsWith('#e8') || lower.startsWith('#f59') || lower.startsWith('#d4')) return 'lime'
  return 'green'
}

interface CreditCard {
  id: string; user_id: string; linked_account_id?: string
  name: string; flag: string; last_four?: string
  credit_limit: number; current_bill: number
  closing_day: number; due_day: number
  color: string; institution?: string; is_active: boolean
}
interface Account { id: string; name: string; type: string }
interface Props { initialCards: CreditCard[]; accounts: Account[] }

export function CreditCardsClient({ initialCards, accounts }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [cards, setCards] = useState(initialCards)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', flag: 'visa', last_four: '', credit_limit: '',
    closing_day: '10', due_day: '17', color: '#C5E4D3',
    institution: '', linked_account_id: '',
  })

  useEffect(() => { setCards(initialCards) }, [initialCards])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nome é obrigatório'
    if (!form.credit_limit || parseFloat(form.credit_limit) <= 0) errs.credit_limit = 'Limite deve ser maior que zero'
    if (form.last_four && !/^\d{4}$/.test(form.last_four)) errs.last_four = 'Informe os 4 últimos dígitos'
    const closing = parseInt(form.closing_day)
    const due = parseInt(form.due_day)
    if (isNaN(closing) || closing < 1 || closing > 28) errs.closing_day = 'Dia inválido (1-28)'
    if (isNaN(due) || due < 1 || due > 28) errs.due_day = 'Dia inválido (1-28)'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      setErrors({ submit: 'Sessão expirada. Faça login novamente.' })
      return
    }
    const { error } = await supabase.from('credit_cards').insert({
      user_id: user.id,
      name: form.name.trim(),
      flag: form.flag,
      last_four: form.last_four || null,
      credit_limit: parseFloat(form.credit_limit),
      current_bill: 0,
      closing_day: parseInt(form.closing_day),
      due_day: parseInt(form.due_day),
      color: form.color,
      institution: form.institution.trim() || null,
      linked_account_id: form.linked_account_id || null,
      is_active: true,
    })
    setSaving(false)
    if (error) { setErrors({ submit: error.message }); return }
    setShowForm(false)
    setErrors({})
    setForm({ name: '', flag: 'visa', last_four: '', credit_limit: '', closing_day: '10', due_day: '17', color: '#C5E4D3', institution: '', linked_account_id: '' })
    showToast('Cartão adicionado com sucesso!')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeleteTarget(id)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const supabase = createClient()
    await supabase.from('credit_cards').update({ is_active: false }).eq('id', deleteTarget)
    setDeleteTarget(null)
    showToast('Cartão excluído', 'info')
    router.refresh()
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      setErrors(ev => { const n = { ...ev }; delete n[key]; return n })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">Cartões de Crédito</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{cards.length} cartão{cards.length !== 1 ? 'ões' : ''} cadastrado{cards.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Novo Cartão
        </button>
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setErrors({}) }} title="Novo Cartão de Crédito">
          {errors.submit && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {errors.submit}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="field sm:col-span-1">
                <label className="label">Nome do cartão *</label>
                <input {...field('name')} placeholder="Ex: Nubank Roxinho" className="input" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div className="field">
                <label className="label">Bandeira *</label>
                <select {...field('flag')} className="select">
                  {FLAGS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Últimos 4 dígitos</label>
                <input {...field('last_four')} placeholder="0000" maxLength={4} className="input" />
                {errors.last_four && <p className="mt-1 text-xs text-red-600">{errors.last_four}</p>}
              </div>
              <div className="field">
                <label className="label">Limite de crédito *</label>
                <CurrencyInput
                  value={form.credit_limit}
                  onChange={(numericValue) => {
                    setForm(f => ({ ...f, credit_limit: numericValue }))
                    setErrors(ev => { const n = { ...ev }; delete n.credit_limit; return n })
                  }}
                  placeholder="0,00"
                  className="input"
                />
                {errors.credit_limit && <p className="mt-1 text-xs text-red-600">{errors.credit_limit}</p>}
              </div>
              <div className="field">
                <label className="label">Dia de fechamento *</label>
                <input type="number" min="1" max="28" {...field('closing_day')} className="input" />
                {errors.closing_day && <p className="mt-1 text-xs text-red-600">{errors.closing_day}</p>}
              </div>
              <div className="field">
                <label className="label">Dia de vencimento *</label>
                <input type="number" min="1" max="28" {...field('due_day')} className="input" />
                {errors.due_day && <p className="mt-1 text-xs text-red-600">{errors.due_day}</p>}
              </div>
              <div className="field">
                <label className="label">Instituição</label>
                <input {...field('institution')} placeholder="Ex: Nubank" className="input" />
              </div>
              <div className="field">
                <label className="label">Conta vinculada para pagamento</label>
                <select {...field('linked_account_id')} className="select">
                  <option value="">Nenhuma</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label">Estilo do cartão</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, color: c.value }))}
                    className="h-8 w-12 rounded-lg border-2 transition-transform hover:scale-105"
                    style={{ backgroundColor: c.value, borderColor: form.color === c.value ? 'var(--color-brand-900)' : 'transparent' }} />
                ))}
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setErrors({}) }} className="btn btn-ghost">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Salvando...' : 'Salvar Cartão'}
              </button>
            </div>
          </form>
      </Modal>

      {cards.length === 0 && !showForm && (
        <div className="card flex flex-col items-center justify-center border-dashed border-2 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <CreditCard className="h-8 w-8 text-brand-700" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-[var(--color-fg)]">Nenhum cartão cadastrado</h3>
          <p className="mb-6 text-sm text-[var(--color-fg-muted)] text-center max-w-xs">
            Adicione seus cartões de crédito para acompanhar faturas, limites e vencimentos.
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Adicionar Cartão
          </button>
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(card => {
            const available = card.credit_limit - card.current_bill
            const pct = card.credit_limit > 0 ? (card.current_bill / card.credit_limit) * 100 : 0
            const linkedAccount = accounts.find(a => a.id === card.linked_account_id)
            const variant = colorVariant(card.color)
            const flagLabel = FLAGS.find(f => f.value === card.flag)?.label ?? card.flag
            const usageColor = pct >= 90 ? 'var(--color-danger)' : pct >= 70 ? 'var(--color-warn)' : 'var(--color-success)'
            const last4 = card.last_four ?? '••••'
            return (
              <div key={card.id} className="space-y-3">
                <div className={`cc ${variant}`}>
                  <div className="top">
                    <div className="brand">{card.institution || 'Cartão'}</div>
                    <div className="net">{flagLabel}</div>
                  </div>
                  <div className="chip-icon" />
                  <div className="number">{`•••• •••• •••• ${last4}`}</div>
                  <div className="bottom">
                    <div className="holder">
                      Titular
                      <b>{card.name}</b>
                    </div>
                    <div className="holder text-right">
                      Vence
                      <b>Dia {card.due_day}</b>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="bar">
                      <div className="fill" style={{ width: `${Math.min(pct, 100)}%`, background: usageColor }} />
                    </div>
                    <div className="mt-1.5 flex justify-between text-xs text-[var(--color-fg-muted)]">
                      <span className="tabular-nums">{formatCurrency(card.current_bill)} / {formatCurrency(card.credit_limit)}</span>
                      <span className="tabular-nums">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-[var(--color-fg-faint)]">
                      <span>Disponível: <span className="tabular-nums" style={{ color: 'var(--color-success)' }}>{formatCurrency(Math.max(available, 0))}</span></span>
                      <span>Fech. Dia {card.closing_day} / Dia {card.due_day}</span>
                    </div>
                    {linkedAccount && (
                      <p className="mt-1 text-xs text-[var(--color-fg-faint)]">
                        Pagamento via: <span className="font-medium text-[var(--color-fg-muted)]">{linkedAccount.name}</span>
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(card.id)} className="icon-btn shrink-0 hover:text-red-500" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Excluir cartão"
        message="Tem certeza que deseja excluir este cartão?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
