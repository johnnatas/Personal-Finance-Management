'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Target, Trophy, Clock, Trash2 } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency, formatDate } from '@/presentation/lib/utils'
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal'
import { Modal } from '@/presentation/components/ui/Modal'
import { useToast } from '@/presentation/components/ui/Toast'

const GOAL_TYPES = [
  { value: 'savings', label: 'Poupança', emoji: '🐷' },
  { value: 'debt_payment', label: 'Pagamento de Dívida', emoji: '💳' },
  { value: 'purchase', label: 'Compra', emoji: '🛒' },
  { value: 'emergency_fund', label: 'Fundo de Emergência', emoji: '🛟' },
  { value: 'other', label: 'Outro', emoji: '🎯' },
]

const PRIORITIES = [
  { value: 'high', label: 'Alta', chip: 'chip danger' },
  { value: 'medium', label: 'Média', chip: 'chip warn' },
  { value: 'low', label: 'Baixa', chip: 'chip success' },
]

interface Goal {
  id: string; name: string; description?: string
  target_amount: number; current_amount: number
  deadline?: string; status: string; type: string; priority: string
}
interface Account { id: string; name: string }
interface Props { initialGoals: Goal[]; accounts: Account[] }

export function GoalsClient({ initialGoals }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [goals, setGoals] = useState(initialGoals)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'savings', target_amount: '', deadline: '', priority: 'medium', description: '',
  })

  useEffect(() => { setGoals(initialGoals) }, [initialGoals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      showToast('Sessão expirada. Faça login novamente.', 'error')
      return
    }
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
    showToast('Meta criada com sucesso!')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeleteTarget(id)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const supabase = createClient()
    await supabase.from('goals').update({ status: 'cancelled' }).eq('id', deleteTarget)
    setDeleteTarget(null)
    showToast('Meta cancelada', 'info')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">Metas</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{goals.filter(g => g.status === 'in_progress').length} em andamento · {goals.filter(g => g.status === 'achieved').length} conquistadas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Nova Meta
        </button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Meta">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="field col-span-1 sm:col-span-2">
                <label className="label">Nome da meta *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Viagem para Europa" className="input" />
              </div>
              <div className="field">
                <label className="label">Tipo *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="select">
                  {GOAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Prioridade</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="select">
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Valor alvo *</label>
                <input required type="number" step="0.01" min="0.01" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                  placeholder="0,00" className="input tabular-nums" />
              </div>
              <div className="field">
                <label className="label">Prazo</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input" />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancelar</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Salvando...' : 'Salvar Meta'}
              </button>
            </div>
          </form>
      </Modal>

      {goals.length === 0 && !showForm && (
        <div className="card flex flex-col items-center justify-center border-dashed border-2 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <Target className="h-8 w-8 text-brand-700" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-[var(--color-fg)]">Nenhuma meta definida</h3>
          <p className="mb-6 text-sm text-[var(--color-fg-muted)]">Defina metas financeiras e acompanhe seu progresso mês a mês.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Criar Meta
          </button>
        </div>
      )}

      {goals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map(goal => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
            const priority = PRIORITIES.find(p => p.value === goal.priority)
            const goalType = GOAL_TYPES.find(t => t.value === goal.type)
            const isAchieved = goal.status === 'achieved'
            return (
              <div key={goal.id} className={`card ${isAchieved ? 'border-[var(--color-brand-400)] bg-brand-100' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${isAchieved ? 'bg-brand-300' : 'bg-[var(--color-surface-muted)]'}`}>
                      {isAchieved ? <Trophy className="h-6 w-6 text-brand-900" /> : <span aria-hidden>{goalType?.emoji ?? '🎯'}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-fg)]">{goal.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={priority?.chip ?? 'chip'}>{priority?.label}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="icon-btn hover:text-red-500" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="bar mb-2">
                  <div className="fill" style={{ width: `${pct}%`, background: isAchieved ? 'var(--color-success)' : 'var(--color-brand-500)' }} />
                </div>
                <div className="flex justify-between text-xs text-[var(--color-fg-muted)] tabular-nums">
                  <span>{formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}</span>
                  <span className="font-medium">{pct.toFixed(0)}%</span>
                </div>
                {goal.deadline && (
                  <div className="mt-3">
                    <span className="chip">
                      <Clock className="h-3 w-3" /> Prazo: {formatDate(goal.deadline)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Cancelar meta"
        message="Tem certeza que deseja cancelar esta meta?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
