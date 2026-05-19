import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { GoalsClient } from './GoalsClient'

export default async function GoalsPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: goals }, { data: accounts }] = await Promise.all([
    supabase.from('goals').select('id, name, description, target_amount, current_amount, deadline, status, type, priority').neq('status', 'cancelled').order('created_at', { ascending: false }),
    supabase.from('accounts').select('id, name').eq('is_active', true),
  ])
  return <GoalsClient initialGoals={goals ?? []} accounts={accounts ?? []} />
}
