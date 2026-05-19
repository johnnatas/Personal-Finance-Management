'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Target, Trophy, Clock, Trash2 } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency, formatDate } from '@/presentation/lib/utils'

const GOAL_TYPES = [
  { value: 'savings', label: 'Poupança' },
  { value: 'debt_payment', label: 'Pagamento de Dívida' },
  { value: 'purchase', label: 'Compra' },
  { value: 'emergency_fund', label: 'Fundo de Emergência' },
  { value: 'other', label: 'Outro' },
]

const PRIORITIES = [
  { value: 'high', label: 'Alta', color: 'text-red-600 bg-red-50' },
  { value: 'medium', label: 'Média', color: 'text-amber-600 bg-amber-50' },
  { value: 'low', label: 'Baixa', color: 'text-emerald-600 bg-emerald-50' },
]

interface Goal {
  id: string; name: string; description?: string
  target_amount: number; current_amount: number
  deadline?: string; status: string; type: string; priority: string
}
interface Account { id: string; name: string }
interface Props { initialGoals: Goal[]; accounts: Account[] }

export function GoalsClient({ initialGoals, accounts }: Props) {
  const router = useRouter()
  const [goals, setGoals] = useState(initialGoals)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'savings', target_amount: '', deadline: '', priority: 'medium', description: '',
  })

  useEffect(() => { setGoals(initialGoals) }, [initialGoals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('goals').insert({
      user_id: user.id,
      name: form.name, type: form.type,
      target_amount: parseFloat(form.target_amount),
      current_amount: 0, status: 'in_progress',
      deadline: form.deadline || null,
      priority: form.priority,
      description: form.description || null,
    })
    setShowForm(false)
    setSaving(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Cancelar esta meta?')) return
    const supabase = createClient()
    await supabase.from('goals').update({ status: 'cancelled' }).eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metas</h1>
          <p className="text-sm text-gray-500">{goals.filter(g => g.status === 'in_progress').length} em andamento · {goals.filter(g => g.status === 'achieved').length} conquistadas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Nova Meta Financeira</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-gray-700">Nome da meta *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Viagem para Europa" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Tipo *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  {GOAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Prioridade</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Valor alvo *</label>
                <input required type="number" step="0.01" min="0.01" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                  placeholder="0,00" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Prazo</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar Meta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <Target className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-gray-900">Nenhuma meta definida</h3>
          <p className="mb-6 text-sm text-gray-500">Defina metas financeiras e acompanhe seu progresso mês a mês.</p>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Criar Meta
          </button>
        </div>
      )}

      {goals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map(goal => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
            const priority = PRIORITIES.find(p => p.value === goal.priority)
            const isAchieved = goal.status === 'achieved'
            return (
              <div key={goal.id} className={`rounded-xl border bg-white p-5 shadow-sm ${isAchieved ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isAchieved ? 'bg-emerald-100' : 'bg-blue-50'}`}>
                      {isAchieved ? <Trophy className="h-5 w-5 text-emerald-600" /> : <Target className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{goal.name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority?.color}`}>{priority?.label}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-2 h-2 w-full rounded-full bg-gray-100">
                  <div className={`h-2 rounded-full transition-all ${isAchieved ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}</span>
                  <span className="font-medium">{pct.toFixed(0)}%</span>
                </div>
                {goal.deadline && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" /> Prazo: {formatDate(goal.deadline)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
