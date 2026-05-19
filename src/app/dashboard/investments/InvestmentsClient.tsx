'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency, formatDate } from '@/presentation/lib/utils'

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
  const [investments, setInvestments] = useState(initialInvestments)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'fixed_income', purchase_value: '', current_value: '',
    quantity: '1', purchase_date: new Date().toISOString().split('T')[0],
    currency: 'BRL', institution: '',
  })

  const totalInvested = investments.reduce((s, i) => s + Number(i.purchase_value) * Number(i.quantity), 0)
  const totalCurrent = investments.reduce((s, i) => s + Number(i.current_value) * Number(i.quantity), 0)
  const totalReturn = totalCurrent - totalInvested
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  const reload = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('investments')
      .select('id, name, type, purchase_value, current_value, quantity, purchase_date, currency, institution')
      .order('created_at', { ascending: false })
    setInvestments(data ?? [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('investments').insert({
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
    await reload()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este investimento?')) return
    const supabase = createClient()
    await supabase.from('investments').delete().eq('id', id)
    await reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investimentos</h1>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-500">Investido: <span className="font-semibold text-gray-900">{formatCurrency(totalInvested)}</span></span>
            <span className="text-gray-500">Atual: <span className="font-semibold text-gray-900">{formatCurrency(totalCurrent)}</span></span>
            {investments.length > 0 && (
              <span className={`font-semibold ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)} ({returnPct.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Novo Investimento
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Novo Investimento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-gray-700">Nome *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Tesouro Selic 2029"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Tipo *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Instituição</label>
                <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                  placeholder="Ex: XP Investimentos"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Valor de compra (unit.) *</label>
                <input required type="number" step="0.01" min="0.01" value={form.purchase_value}
                  onChange={e => setForm(f => ({ ...f, purchase_value: e.target.value }))}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Valor atual (unit.)</label>
                <input type="number" step="0.01" min="0" value={form.current_value}
                  onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))}
                  placeholder="Igual ao de compra"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Quantidade *</label>
                <input required type="number" step="0.0001" min="0.0001" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Data de compra *</label>
                <input required type="date" value={form.purchase_date}
                  onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar Investimento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {investments.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <TrendingUp className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-gray-900">Nenhum investimento registrado</h3>
          <p className="mb-6 text-sm text-gray-500 text-center max-w-xs">
            Acompanhe sua carteira de investimentos e veja sua evolução patrimonial.
          </p>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" /> Adicionar Investimento
          </button>
        </div>
      )}

      {investments.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ativo</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Investido</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Atual</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Retorno</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {investments.map(inv => {
                const invested = Number(inv.purchase_value) * Number(inv.quantity)
                const current = Number(inv.current_value) * Number(inv.quantity)
                const ret = current - invested
                const retPct = invested > 0 ? (ret / invested) * 100 : 0
                const isPositive = ret >= 0
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{inv.name}</p>
                      <p className="text-xs text-gray-400">
                        {INVESTMENT_TYPES.find(t => t.value === inv.type)?.label}
                        {inv.institution && ` · ${inv.institution}`}
                        {` · ${formatDate(inv.purchase_date)}`}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-700">{formatCurrency(invested)}</td>
                    <td className="px-5 py-4 text-right font-medium text-gray-900">{formatCurrency(current)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {isPositive ? '+' : ''}{formatCurrency(ret)} ({retPct.toFixed(2)}%)
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <button onClick={() => handleDelete(inv.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
