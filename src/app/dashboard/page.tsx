import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { getFirstDayOfMonth, getLastDayOfMonth } from '@/presentation/lib/utils'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const now = new Date()
  const startDate = getFirstDayOfMonth(now)
  const endDate = getLastDayOfMonth(now)

  // Next month range for upcoming expenses
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
  const nextMonthStartStr = nextMonthStart.toISOString().split('T')[0]
  const nextMonthEndStr = nextMonthEnd.toISOString().split('T')[0]

  // Last 6 months for trend chart
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0]

  const { data: { user } } = await supabase.auth.getUser()
  const userName = (user?.user_metadata?.full_name as string | undefined)
    ?? (user?.user_metadata?.name as string | undefined)
    ?? (user?.email ? String(user.email).split('@')[0] : 'Você')

  const [
    { data: accounts },
    { data: creditCards },
    { data: categories },
    { data: monthTransactions },
    { data: trendTransactions },
    { data: upcomingExpenses },
    { data: recentTransactions },
  ] = await Promise.all([
    supabase.from('accounts').select('id, name, current_balance, color, type, currency, is_active').eq('is_active', true),
    supabase.from('credit_cards').select('id, name, current_bill, credit_limit, color, flag').eq('is_active', true),
    supabase.from('categories').select('id, name, type, color, icon').eq('is_active', true).order('name'),
    supabase.from('transactions_detailed').select('type, amount, category_name, category_color, date, status').gte('date', startDate).lte('date', endDate),
    supabase.from('transactions_detailed').select('type, amount, date, status').gte('date', sixMonthsAgoStr).lte('date', endDate).eq('status', 'completed'),
    supabase.from('transactions_detailed').select('id, description, amount, date, category_name, category_color, account_name, status').eq('type', 'expense').eq('status', 'pending').or(`date.gte.${startDate},date.gte.${nextMonthStartStr}`).lte('date', nextMonthEndStr).order('date'),
    supabase.from('transactions_detailed').select('*').order('date', { ascending: false }).limit(8),
  ])

  const completed = (monthTransactions ?? []).filter(t => t.status === 'completed')
  const income = completed.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = completed.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const totalBalance = (accounts ?? []).reduce((s, a) => s + Number(a.current_balance), 0)

  const initialAccounts = (accounts ?? []).map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    current_balance: Number(a.current_balance),
    currency: (a as { currency?: string }).currency ?? 'BRL',
    color: a.color,
    isActive: a.is_active ?? true,
    currentBalance: Number(a.current_balance),
  }))

  return (
    <DashboardClient
      totalBalance={totalBalance}
      income={income}
      expense={expense}
      accounts={accounts ?? []}
      creditCards={creditCards ?? []}
      initialAccounts={initialAccounts}
      initialCategories={categories ?? []}
      monthTransactions={monthTransactions ?? []}
      trendTransactions={trendTransactions ?? []}
      upcomingExpenses={upcomingExpenses ?? []}
      recentTransactions={recentTransactions ?? []}
      currentMonth={now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
      userName={userName}
    />
  )
}
