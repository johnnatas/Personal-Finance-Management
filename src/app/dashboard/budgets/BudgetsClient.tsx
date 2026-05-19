'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, PieChart, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency } from '@/presentation/lib/utils'

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

function ProgressBar({ value, max, threshold }: { value: number; max: number; threshold: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct >= 100 ? 'bg-red-500' : pct >= threshold ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function BudgetsClient({ initialBudgets, categories }: Props) {
  const router = useRouter()
  const [budgets, setBudgets] = useState(initialBudgets)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  const [form, setForm] = useState({
    category_id: '', amount: '', period: 'monthly',
    start_date: today.slice(0, 7) + '-01', end_date: lastDay, alert_threshold: '80',
  })

  useEffect(() => { setBudgets(initialBudgets) }, [initialBudgets])

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
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este orçamento?')) return
    const supabase = createClient()
    await supabase.from('budgets').update({ is_active: false }).eq('id', id)
    router.refresh()
  }

  const getCategoryName = (id: string | null) => categories.find(c => c.id === id)?.name ?? 'Geral'
  const getCategoryColor = (id: string | null) => categories.find(c => c.id === id)?.color ?? '#6B7280'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-sm text-gray-500">{budgets.length} orçamento{budgets.length !== 1 ? 's' : ''} ativo{budgets.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Novo Orçamento
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Novo Orçamento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Categoria</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  <option value="">Geral (todas as categorias)</option>
                  {categories.filter(c => c.name !== 'Salário' && c.name !== 'Freelance' && c.name !== 'Investimentos').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Período</label>
                <select value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Valor limite *</label>
                <input required type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0,00" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Alerta em (%)</label>
                <input type="number" min="0" max="150" value={form.alert_threshold} onChange={e => setForm(f => ({ ...f, alert_threshold: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Data início *</label>
                <input required type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Data fim *</label>
                <input required type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar Orçamento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {budgets.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-gray-900">Nenhum orçamento criado</h3>
          <p className="mb-6 text-sm text-gray-500">Defina limites de gastos por categoria para manter suas finanças sob controle.</p>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Criar Orçamento
          </button>
        </div>
      )}

      {budgets.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map(budget => {
            const pct = Math.min((budget.spent / budget.amount) * 100, 100)
            const isOver = pct >= 100
            const isNear = pct >= budget.alert_threshold && !isOver
            const color = getCategoryColor(budget.category_id)
            return (
              <div key={budget.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                      <PieChart className="h-5 w-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{getCategoryName(budget.category_id)}</p>
                      <p className="text-xs text-gray-400">{PERIODS.find(p => p.value === budget.period)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {!isOver && !isNear && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    <button onClick={() => handleDelete(budget.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <ProgressBar value={budget.spent} max={budget.amount} threshold={budget.alert_threshold} />
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Gasto: <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(budget.spent)}</span></span>
                  <span>Limite: <span className="font-semibold text-gray-900">{formatCurrency(budget.amount)}</span></span>
                </div>
                <p className="mt-1 text-right text-xs text-gray-400">{pct.toFixed(0)}% utilizado</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
