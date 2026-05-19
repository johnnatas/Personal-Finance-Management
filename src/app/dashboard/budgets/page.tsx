import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { BudgetsClient } from './BudgetsClient'

export default async function BudgetsPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: budgets }, { data: categories }] = await Promise.all([
    supabase.from('budgets').select('id, category_id, amount, spent, period, start_date, end_date, alert_threshold, is_active').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name, color, icon').eq('is_active', true).order('name'),
  ])
  return <BudgetsClient initialBudgets={budgets ?? []} categories={categories ?? []} />
}
