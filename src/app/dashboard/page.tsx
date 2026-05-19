import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, formatDate, getFirstDayOfMonth, getLastDayOfMonth } from '@/presentation/lib/utils'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const startDate = getFirstDayOfMonth(now)
  const endDate = getLastDayOfMonth(now)

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from('accounts').select('current_balance, currency').eq('is_active', true),
    supabase.from('transactions').select('type, amount, date, status').eq('status', 'completed').gte('date', startDate).lte('date', endDate).is('deleted_at', null),
  ])

  const totalBalance = (accounts ?? []).reduce((sum, a) => sum + Number(a.current_balance), 0)
  const income = (transactions ?? []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = (transactions ?? []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Resumo de {now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <Link href="/dashboard/transactions" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Nova Transação
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Saldo Total', value: totalBalance, color: 'blue' },
          { label: 'Receitas do Mês', value: income, color: 'emerald' },
          { label: 'Despesas do Mês', value: expense, color: 'red' },
          { label: 'Resultado do Mês', value: balance, color: balance >= 0 ? 'emerald' : 'red' },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color === 'emerald' ? 'text-emerald-600' : card.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Transações Recentes</h2>
          <Link href="/dashboard/transactions" className="text-xs font-medium text-blue-600 hover:underline">Ver todas</Link>
        </div>
        <RecentTransactions userId={user!.id} startDate={startDate} endDate={endDate} />
      </div>
    </div>
  )
}

async function RecentTransactions({ userId, startDate, endDate }: { userId: string; startDate: string; endDate: string }) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('transactions_detailed')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(10)

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-gray-400">Nenhuma transação neste período</p>
        <Link href="/dashboard/transactions" className="mt-3 text-xs font-medium text-blue-600 hover:underline">Adicionar primeira transação</Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {data.map((t: Record<string, unknown>) => (
        <div key={t.id as string} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: (t.category_color as string) || '#6B7280' }}>
              {(t.category_name as string)?.[0] ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{t.description as string}</p>
              <p className="text-xs text-gray-400">{(t.category_name as string) ?? 'Sem categoria'} · {t.account_name as string} · {formatDate(t.date as string)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {t.type === 'income'
              ? <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              : <ArrowDownRight className="h-4 w-4 text-red-500" />}
            <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(Number(t.amount))}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
