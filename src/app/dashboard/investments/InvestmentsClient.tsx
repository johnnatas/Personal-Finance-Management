'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency, formatDate } from '@/presentation/lib/utils'
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal'
import { useToast } from '@/presentation/components/ui/Toast'

const INVESTMENT_TYPES = [
  { value: 'stocks', label: 'Ações' },
  { value: 'fiis', label: 'FIIs' },
  { value: 'fixed_income', label: 'Renda Fixa' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'funds', label: 'Fundos' },
  { value: 'pension', label: 'Previdência' },
  { value: 'other', label: 'Outro' },
]

interface Investment {
  id: string; name: string; type: string
  purchase_value: number; current_value: number
  quantity: number; purchase_date: string
  currency: string; institution?: string
}

interface Props { initialInvestments: Investment[] }

export function InvestmentsClient({ initialInvestments }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [investments, setInvestments] = useState(initialInvestments)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'fixed_income', purchase_value: '', current_value: '',
    quantity: '1', purchase_date: new Date().toISOString().split('T')[0],
    currency: 'BRL', institution: '',
  })

  useEffect(() => { setInvestments(initialInvestments) }, [initialInvestments])

  const totalInvested = investments.reduce((s, i) => s + Number(i.purchase_value) * Number(i.quantity), 0)
  const totalCurrent = investments.reduce((s, i) => s + Number(i.current_value) * Number(i.quantity), 0)
  const totalReturn = totalCurrent - totalInvested
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('investments').insert({
      user_id: user.id,
      name: form.name, type: form.type,
      purchase_value: parseFloat(form.purchase_value),
      current_value: parseFloat(form.current_value || form.purchase_value),
      quantity: parseFloat(form.quantity),
      purchase_date: form.purchase_date,
      currency: form.currency,
      institution: form.institution || null,
    })
    setShowForm(false)
    setSaving(false)
    showToast('Investimento registrado com sucesso!')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeleteTarget(id)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const supabase = createClient()
    await supabase.from('investments').delete().eq('id', deleteTarget)
    setDeleteTarget(null)
    showToast('Investimento excluído', 'info')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">Investimentos</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">Carteira e evolução patrimonial</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Novo Investimento
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-label">Investido</p>
          <p className="stat-value">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Atual</p>
          <p className="stat-value">{formatCurrency(totalCurrent)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Retorno</p>
          <p className="stat-value" style={{ color: totalReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
          </p>
          {investments.length > 0 && (
            <span className={`stat-delta ${totalReturn >= 0 ? 'up' : 'down'}`}>
              {totalReturn >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {returnPct.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="mb-5 text-[15px] font-semibold text-[var(--color-fg)]">Novo Investimento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="field col-span-1 sm:col-span-2">
                <label className="label">Nome *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Tesouro Selic 2029" className="input" />
              </div>
              <div className="field">
                <label className="label">Tipo *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="select">
                  {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Instituição</label>
                <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                  placeholder="Ex: XP Investimentos" className="input" />
              </div>
              <div className="field">
                <label className="label">Valor de compra (unit.) *</label>
                <input required type="number" step="0.01" min="0.01" value={form.purchase_value}
                  onChange={e => setForm(f => ({ ...f, purchase_value: e.target.value }))}
                  placeholder="0,00" className="input tabular-nums" />
              </div>
              <div className="field">
                <label className="label">Valor atual (unit.)</label>
                <input type="number" step="0.01" min="0" value={form.current_value}
                  onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))}
                  placeholder="Igual ao de compra" className="input tabular-nums" />
              </div>
              <div className="field">
                <label className="label">Quantidade *</label>
                <input required type="number" step="0.0001" min="0.0001" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input tabular-nums" />
              </div>
              <div className="field">
                <label className="label">Data de compra *</label>
                <input required type="date" value={form.purchase_date}
                  onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} className="input" />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Salvando...' : 'Salvar Investimento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {investments.length === 0 && !showForm && (
        <div className="card flex flex-col items-center justify-center border-dashed border-2 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <TrendingUp className="h-8 w-8 text-brand-700" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-[var(--color-fg)]">Nenhum investimento registrado</h3>
          <p className="mb-6 text-sm text-[var(--color-fg-muted)] text-center max-w-xs">
            Acompanhe sua carteira de investimentos e veja sua evolução patrimonial.
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Adicionar Investimento
          </button>
        </div>
      )}

      {investments.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="flex flex-col">
            {investments.map(inv => {
              const invested = Number(inv.purchase_value) * Number(inv.quantity)
              const current = Number(inv.current_value) * Number(inv.quantity)
              const ret = current - invested
              const retPct = invested > 0 ? (ret / invested) * 100 : 0
              const isPositive = ret >= 0
              const typeLabel = INVESTMENT_TYPES.find(t => t.value === inv.type)?.label
              return (
                <div key={inv.id} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--color-border-soft)] last:border-b-0 hover:bg-[var(--color-surface-muted)] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="chip">{typeLabel}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--color-fg)] truncate">{inv.name}</p>
                      <p className="text-xs text-[var(--color-fg-faint)]">
                        {inv.institution && `${inv.institution} · `}{formatDate(inv.purchase_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[var(--color-fg-faint)]">Investido</p>
                      <p className="text-sm font-medium tabular-nums text-[var(--color-fg-muted)]">{formatCurrency(invested)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--color-fg-faint)]">Atual</p>
                      <p className="text-sm font-semibold tabular-nums text-[var(--color-fg)]">{formatCurrency(current)}</p>
                    </div>
                    <div className="text-right">
                      <div
                        className="flex items-center justify-end gap-1 text-sm font-semibold tabular-nums"
                        style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}
                      >
                        {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {isPositive ? '+' : ''}{retPct.toFixed(2)}%
                      </div>
                      <p className="text-xs tabular-nums" style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {isPositive ? '+' : ''}{formatCurrency(ret)}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(inv.id)} className="icon-btn hover:text-red-500" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Excluir investimento"
        message="Tem certeza que deseja excluir este investimento?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
