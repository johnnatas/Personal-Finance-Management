import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { ExpensesListClient } from './ExpensesListClient'

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams
  const supabase = await createServerSupabaseClient()

  const now = new Date()
  const selectedMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, mon] = selectedMonth.split('-').map(Number)
  const dateFrom = `${year}-${String(mon).padStart(2, '0')}-01`
  const dateTo = new Date(year, mon, 0).toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions_detailed')
    .select('*')
    .eq('type', 'expense')
    .gte('date', dateFrom)
    .lte('date', dateTo)
    .order('date', { ascending: false })

  const total = (transactions ?? []).filter(t => t.status === 'completed').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <ExpensesListClient
      transactions={transactions ?? []}
      total={total}
      selectedMonth={selectedMonth}
    />
  )
}
