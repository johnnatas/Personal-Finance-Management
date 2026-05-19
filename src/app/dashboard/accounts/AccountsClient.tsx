'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Wallet, Building2, CreditCard, TrendingUp, Banknote, MoreHorizontal, Trash2 } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency } from '@/presentation/lib/utils'

const ACCOUNT_TYPES = [
  { value: 'checking_account', label: 'Conta Corrente', icon: Building2 },
  { value: 'savings_account', label: 'Poupança', icon: Wallet },
  { value: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard },
  { value: 'investment', label: 'Investimentos', icon: TrendingUp },
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'other', label: 'Outro', icon: MoreHorizontal },
]

const COLORS = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#EC4899','#6366F1','#14B8A6']

interface Account {
  id: string; name: string; type: string; current_balance: number
  initial_balance: number; currency: string; color: string
  institution?: string; is_active: boolean
}

interface Props { initialAccounts: Account[] }

function AccountIcon({ type, color }: { type: string; color: string }) {
  const found = ACCOUNT_TYPES.find(t => t.value === type)
  const Icon = found?.icon ?? Wallet
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: color + '20' }}>
      <Icon className="h-6 w-6" style={{ color }} />
    </div>
  )
}

function AccountTypeLabel({ type }: { type: string }) {
  return ACCOUNT_TYPES.find(t => t.value === type)?.label ?? type
}

function AccountsInner({ initialAccounts }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const [accounts, setAccounts] = useState(initialAccounts)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'checking_account', initial_balance: '',
    currency: 'BRL', color: '#3B82F6', institution: '',
  })

  useEffect(() => { setAccounts(initialAccounts) }, [initialAccounts])

  const totalBalance = accounts.filter(a => a.is_active).reduce((s, a) => s + Number(a.current_balance), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const balance = parseFloat(form.initial_balance) || 0
    await supabase.from('accounts').insert({
      user_id: user.id,
      name: form.name, type: form.type,
      initial_balance: balance, current_balance: balance,
      currency: form.currency, color: form.color,
      institution: form.institution || null, is_active: true,
    })
    setShowForm(false)
    setForm({ name: '', type: 'checking_account', initial_balance: '', currency: 'BRL', color: '#3B82F6', institution: '' })
    setSaving(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Desativar esta conta?')) return
    const supabase = createClient()
    await supabase.from('accounts').update({ is_active: false }).eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {isOnboarding && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 shrink-0">
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Bem-vindo! Vamos configurar sua primeira conta</p>
            <p className="text-xs text-blue-700 mt-0.5">Adicione sua conta bancária, carteira ou cartão de crédito para começar a registrar suas finanças.</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
          <p className="text-sm text-gray-500">Saldo total: <span className="font-semibold text-gray-900">{formatCurrency(totalBalance)}</span></p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nova Conta
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Nova Conta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nome da conta *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Nubank" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Tipo *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
                  {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Saldo inicial</label>
                <input type="number" step="0.01" min="0" value={form.initial_balance} onChange={e => setForm(f => ({ ...f, initial_balance: e.target.value }))}
                  placeholder="0,00" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Instituição</label>
                <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                  placeholder="Ex: Banco do Brasil" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
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
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar Conta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {accounts.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-gray-900">Nenhuma conta cadastrada</h3>
          <p className="mb-6 text-sm text-gray-500">Adicione sua primeira conta para começar a controlar suas finanças.</p>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" /> Adicionar Conta
          </button>
        </div>
      )}

      {/* Lista de contas */}
      {accounts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.filter(a => a.is_active).map(account => (
            <div key={account.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <AccountIcon type={account.type} color={account.color} />
                <button onClick={() => handleDelete(account.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide"><AccountTypeLabel type={account.type} /></p>
                <p className="mt-0.5 text-base font-semibold text-gray-900">{account.name}</p>
                {account.institution && <p className="text-xs text-gray-400">{account.institution}</p>}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500">Saldo atual</p>
                <p className={`text-xl font-bold ${Number(account.current_balance) >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {formatCurrency(account.current_balance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AccountsClient({ initialAccounts }: Props) {
  return (
    <Suspense fallback={null}>
      <AccountsInner initialAccounts={initialAccounts} />
    </Suspense>
  )
}
