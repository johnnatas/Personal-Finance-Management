import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { SummaryCard } from '@/presentation/components/dashboard/SummaryCard'
import { formatDate, getFirstDayOfMonth, getLastDayOfMonth } from '@/presentation/lib/utils'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const startDate = getFirstDayOfMonth(now)
  const endDate = getLastDayOfMonth(now)

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from('accounts').select('current_balance, currency').eq('is_active', true),
    supabase
      .from('transactions')
      .select('type, amount, date, status')
      .eq('status', 'completed')
      .gte('date', startDate)
      .lte('date', endDate)
      .is('deleted_at', null),
  ])

  const totalBalance = (accounts ?? []).reduce((sum, a) => sum + Number(a.current_balance), 0)
  const income = (transactions ?? []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = (transactions ?? []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{formatDate(now)} — Resumo do mês atual</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Saldo Total" amount={totalBalance} variant="balance" />
        <SummaryCard title="Receitas do Mês" amount={income} variant="income" />
        <SummaryCard title="Despesas do Mês" amount={expense} variant="expense" />
        <SummaryCard title="Saldo do Mês" amount={income - expense} variant={income - expense >= 0 ? 'savings' : 'expense'} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Transações Recentes</h2>
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
    .order('date', { ascending: false })
    .limit(10)

  if (!data?.length) {
    return <p className="text-center text-sm text-gray-400 py-8">Nenhuma transação neste período</p>
  }

  return (
    <div className="divide-y divide-gray-100">
      {data.map((t: Record<string, string | number>) => (
        <div key={t.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold"
              style={{ backgroundColor: (t.category_color as string) || '#6B7280' }}
            >
              {(t.category_name as string)?.[0] ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{t.description}</p>
              <p className="text-xs text-gray-500">{t.category_name ?? 'Sem categoria'} · {t.account_name}</p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
            {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2).replace('.', ',')}
          </span>
        </div>
      ))}
    </div>
  )
}
