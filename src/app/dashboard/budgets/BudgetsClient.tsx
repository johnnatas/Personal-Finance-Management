'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, PieChart, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency } from '@/presentation/lib/utils'
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal'
import { CurrencyInput } from '@/presentation/components/ui/CurrencyInput'
import { useToast } from '@/presentation/components/ui/Toast'

const PERIODS = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
]

interface Budget {
  id: string; category_id: string | null; amount: number; spent: number
  period: string; start_date: string; end_date: string
  alert_threshold: number; is_active: boolean
}
interface Category { id: string; name: string; color: string; icon: string }
interface Props { initialBudgets: Budget[]; categories: Category[] }

export function BudgetsClient({ initialBudgets, categories }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [budgets, setBudgets] = useState(initialBudgets)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  const [form, setForm] = useState({
    category_id: '', amount: '', period: 'monthly',
    start_date: today.slice(0, 7) + '-01', end_date: lastDay, alert_threshold: '80',
  })

  useEffect(() => { setBudgets(initialBudgets) }, [initialBudgets])

  const totalPlanned = budgets.reduce((s, b) => s + Number(b.amount), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0)
  const totalPct = totalPlanned > 0 ? Math.min((totalSpent / totalPlanned) * 100, 100) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('budgets').insert({
      user_id: user.id,
      category_id: form.category_id || null,
      amount: parseFloat(form.amount),
      period: form.period,
      start_date: form.start_date,
      end_date: form.end_date,
      alert_threshold: parseInt(form.alert_threshold),
      spent: 0,
    })
    setShowForm(false)
    setSaving(false)
    showToast('Orçamento criado com sucesso!')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeleteTarget(id)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const supabase = createClient()
    await supabase.from('budgets').update({ is_active: false }).eq('id', deleteTarget)
    setDeleteTarget(null)
    showToast('Orçamento excluído', 'info')
    router.refresh()
  }

  const getCategoryName = (id: string | null) => categories.find(c => c.id === id)?.name ?? 'Geral'
  const getCategoryColor = (id: string | null) => categories.find(c => c.id === id)?.color ?? '#6B7280'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">Orçamentos</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{budgets.length} orçamento{budgets.length !== 1 ? 's' : ''} ativo{budgets.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Novo Orçamento
        </button>
      </div>

      {/* Featured summary */}
      {budgets.length > 0 && (
        <div className="stat-card featured">
          <p className="stat-label">Total Gasto / Planejado</p>
          <p className="stat-value tabular-nums">{formatCurrency(totalSpent)} <span className="text-base font-medium opacity-70">/ {formatCurrency(totalPlanned)}</span></p>
          <div className="bar mt-2" style={{ background: 'rgba(45,74,62,0.18)' }}>
            <div className="fill" style={{ width: `${totalPct}%`, background: 'var(--color-brand-900)' }} />
          </div>
        </div>
      )}

      {showForm && (
        <div className="card">
          <h2 className="mb-5 text-[15px] font-semibold text-[var(--color-fg)]">Novo Orçamento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="field">
                <label className="label">Categoria</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="select">
                  <option value="">Geral (todas as categorias)</option>
                  {categories.filter(c => c.name !== 'Salário' && c.name !== 'Freelance' && c.name !== 'Investimentos').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label">Período</label>
                <select value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className="select">
                  {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Valor limite *</label>
                <CurrencyInput
                  value={form.amount}
                  onChange={(numericValue) => setForm(f => ({ ...f, amount: numericValue }))}
                  placeholder="0,00"
                  className="input"
                />
              </div>
              <div className="field">
                <label className="label">Alerta em (%)</label>
                <input type="number" min="0" max="150" value={form.alert_threshold} onChange={e => setForm(f => ({ ...f, alert_threshold: e.target.value }))} className="input" />
              </div>
              <div className="field">
                <label className="label">Data início *</label>
                <input required type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="input" />
              </div>
              <div className="field">
                <label className="label">Data fim *</label>
                <input required type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="input" />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Salvando...' : 'Salvar Orçamento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {budgets.length === 0 && !showForm && (
        <div className="card flex flex-col items-center justify-center border-dashed border-2 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <PieChart className="h-8 w-8 text-brand-700" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-[var(--color-fg)]">Nenhum orçamento criado</h3>
          <p className="mb-6 text-sm text-[var(--color-fg-muted)]">Defina limites de gastos por categoria para manter suas finanças sob controle.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Criar Orçamento
          </button>
        </div>
      )}

      {budgets.length > 0 && (
        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Por categoria</h2>
          </div>
          <div className="flex flex-col gap-5">
            {budgets.map(budget => {
              const pct = Math.min((budget.spent / budget.amount) * 100, 100)
              const isOver = pct >= 100
              const isNear = pct >= budget.alert_threshold && !isOver
              const color = getCategoryColor(budget.category_id)
              const chipClass = isOver ? 'chip danger' : isNear ? 'chip warn' : 'chip success'
              const fillColor = isOver ? 'var(--color-danger)' : isNear ? 'var(--color-warn)' : 'var(--color-success)'
              return (
                <div key={budget.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                        <PieChart className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[var(--color-fg)]">{getCategoryName(budget.category_id)}</p>
                        <p className="text-xs text-[var(--color-fg-faint)]">{PERIODS.find(p => p.value === budget.period)?.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={chipClass}>
                        {isOver ? <AlertTriangle className="h-3 w-3" /> : !isNear ? <CheckCircle2 className="h-3 w-3" /> : null}
                        {pct.toFixed(0)}%
                      </span>
                      <button onClick={() => handleDelete(budget.id)} className="icon-btn hover:text-red-500" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${pct}%`, background: fillColor }} />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--color-fg-muted)] tabular-nums">
                    <span>Gasto: <span className="font-semibold" style={{ color: isOver ? 'var(--color-danger)' : 'var(--color-fg)' }}>{formatCurrency(budget.spent)}</span></span>
                    <span>Limite: <span className="font-semibold text-[var(--color-fg)]">{formatCurrency(budget.amount)}</span></span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Excluir orçamento"
        message="Tem certeza que deseja excluir este orçamento?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
