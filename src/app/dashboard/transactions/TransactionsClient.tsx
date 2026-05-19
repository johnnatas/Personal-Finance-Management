'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Trash2 } from 'lucide-react'
import { TransactionForm } from '@/presentation/components/transactions/TransactionForm'
import { useTransactions } from '@/presentation/hooks/useTransactions'
import { formatCurrency, formatDate, getFirstDayOfMonth, getLastDayOfMonth } from '@/presentation/lib/utils'
import { createClient } from '@/infrastructure/supabase/client'

interface Account { id: string; name: string; type: string; current_balance: number; currency: string; color: string; isActive: boolean; currentBalance: number }
interface Category { id: string; name: string; type: string; color: string; icon: string }
interface Props { initialAccounts: Account[]; initialCategories: Category[] }

export function TransactionsClient({ initialAccounts, initialCategories }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  const now = new Date()
  const { transactions, loading, error, refetch } = useTransactions({
    dateFrom: getFirstDayOfMonth(now),
    dateTo: getLastDayOfMonth(now),
    type: filterType || undefined,
  })

  const filtered = transactions.filter(t =>
    !search || t.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (data: Record<string, unknown>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
      account_id: data.accountId,
      category_id: data.categoryId || null,
      payment_method: data.paymentMethod || null,
      status: data.status,
      notes: data.notes || null,
      is_recurrent: false,
      tags: [],
    })
    if (err) throw new Error(err.message)
    setShowForm(false)
    refetch()
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta transação?')) return
    const supabase = createClient()
    await supabase.from('transactions').update({ deleted_at: new Date().toISOString(), status: 'cancelled' }).eq('id', id)
    refetch()
    router.refresh()
  }

  const typeIcon = (type: string) => {
    if (type === 'income') return <ArrowUpRight className="h-4 w-4 text-emerald-500" />
    if (type === 'expense') return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <ArrowLeftRight className="h-4 w-4 text-blue-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-sm text-gray-500">{filtered.length} transaç{filtered.length !== 1 ? 'ões' : 'ão'} no período</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Nova Transação
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Nova Transação</h2>
          <TransactionForm
            accounts={initialAccounts}
            categories={initialCategories}
            onSubmit={handleSubmit as Parameters<typeof TransactionForm>[0]['onSubmit']}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar transações..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none">
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
          <option value="transfer">Transferências</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <ArrowLeftRight className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">{search ? 'Nenhuma transação encontrada' : 'Nenhuma transação neste período'}</p>
            {!search && <button onClick={() => setShowForm(true)} className="mt-3 text-xs font-medium text-blue-600 hover:underline">Adicionar transação</button>}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(t => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: t.category_color || '#6B7280' }}>
                    {t.category_name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-400">{t.category_name ?? 'Sem categoria'} · {t.account_name} · {formatDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {typeIcon(t.type)}
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
