'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CreditCard, Trash2, AlertCircle } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency } from '@/presentation/lib/utils'

const FLAGS = [
  { value: 'visa', label: 'Visa', color: '#1A1F71' },
  { value: 'mastercard', label: 'Mastercard', color: '#EB001B' },
  { value: 'elo', label: 'Elo', color: '#00A4E0' },
  { value: 'amex', label: 'American Express', color: '#2E77BC' },
  { value: 'hipercard', label: 'Hipercard', color: '#B3131B' },
  { value: 'other', label: 'Outro', color: '#6B7280' },
]

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6']

interface CreditCard {
  id: string; user_id: string; linked_account_id?: string
  name: string; flag: string; last_four?: string
  credit_limit: number; current_bill: number
  closing_day: number; due_day: number
  color: string; institution?: string; is_active: boolean
}
interface Account { id: string; name: string; type: string }
interface Props { initialCards: CreditCard[]; accounts: Account[] }

function FlagBadge({ flag }: { flag: string }) {
  const found = FLAGS.find(f => f.value === flag)
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: found?.color ?? '#6B7280' }}>
      {found?.label ?? flag}
    </span>
  )
}

function UsageBar({ current, limit }: { current: number; limit: number }) {
  const pct = limit > 0 ? Math.min((current / limit) * 100, 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100">
      <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function CreditCardsClient({ initialCards, accounts }: Props) {
  const router = useRouter()
  const [cards, setCards] = useState(initialCards)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '', flag: 'visa', last_four: '', credit_limit: '',
    closing_day: '10', due_day: '17', color: '#8B5CF6',
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
    if (!user) return
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
    setForm({ name: '', flag: 'visa', last_four: '', credit_limit: '', closing_day: '10', due_day: '17', color: '#8B5CF6', institution: '', linked_account_id: '' })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cartão?')) return
    const supabase = createClient()
    await supabase.from('credit_cards').update({ is_active: false }).eq('id', id)
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
          <h1 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h1>
          <p className="text-sm text-gray-500">{cards.length} cartão{cards.length !== 1 ? 'ões' : ''} cadastrado{cards.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Novo Cartão
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Novo Cartão de Crédito</h2>
          {errors.submit && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {errors.submit}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-gray-700">Nome do cartão *</label>
                <input {...field('name')} placeholder="Ex: Nubank Roxinho"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Bandeira *</label>
                <select {...field('flag')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  {FLAGS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Últimos 4 dígitos</label>
                <input {...field('last_four')} placeholder="0000" maxLength={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
                {errors.last_four && <p className="text-xs text-red-600">{errors.last_four}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Limite de crédito *</label>
                <input type="number" step="0.01" min="0.01" {...field('credit_limit')} placeholder="0,00"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
                {errors.credit_limit && <p className="text-xs text-red-600">{errors.credit_limit}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Dia de fechamento *</label>
                <input type="number" min="1" max="28" {...field('closing_day')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                {errors.closing_day && <p className="text-xs text-red-600">{errors.closing_day}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Dia de vencimento *</label>
                <input type="number" min="1" max="28" {...field('due_day')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
                {errors.due_day && <p className="text-xs text-red-600">{errors.due_day}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Instituição</label>
                <input {...field('institution')} placeholder="Ex: Nubank"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Conta vinculada para pagamento</label>
                <select {...field('linked_account_id')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  <option value="">Nenhuma</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Cor</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: form.color === c ? '#1e40af' : 'transparent' }} />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setErrors({}) }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar Cartão'}
              </button>
            </div>
          </form>
        </div>
      )}

      {cards.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-gray-900">Nenhum cartão cadastrado</h3>
          <p className="mb-6 text-sm text-gray-500 text-center max-w-xs">
            Adicione seus cartões de crédito para acompanhar faturas, limites e vencimentos.
          </p>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" /> Adicionar Cartão
          </button>
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(card => {
            const available = card.credit_limit - card.current_bill
            const pct = card.credit_limit > 0 ? (card.current_bill / card.credit_limit) * 100 : 0
            const linkedAccount = accounts.find(a => a.id === card.linked_account_id)
            return (
              <div key={card.id} className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: card.color }} />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FlagBadge flag={card.flag} />
                      {card.last_four && <span className="text-xs text-gray-400">•••• {card.last_four}</span>}
                    </div>
                    <p className="font-semibold text-gray-900">{card.name}</p>
                    {card.institution && <p className="text-xs text-gray-400">{card.institution}</p>}
                  </div>
                  <button onClick={() => handleDelete(card.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Fatura atual</span>
                      <span>{pct.toFixed(0)}% do limite</span>
                    </div>
                    <UsageBar current={card.current_bill} limit={card.credit_limit} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Fatura</p>
                      <p className="font-semibold text-red-600">{formatCurrency(card.current_bill)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Disponível</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(Math.max(available, 0))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Limite total</p>
                      <p className="font-medium text-gray-700">{formatCurrency(card.credit_limit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Fechamento / Vencimento</p>
                      <p className="font-medium text-gray-700">Dia {card.closing_day} / Dia {card.due_day}</p>
                    </div>
                  </div>
                  {linkedAccount && (
                    <p className="text-xs text-gray-400 border-t border-gray-50 pt-2">
                      Pagamento via: <span className="font-medium text-gray-600">{linkedAccount.name}</span>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
