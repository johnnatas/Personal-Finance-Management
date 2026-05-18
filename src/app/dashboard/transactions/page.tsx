import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { TransactionsClient } from './TransactionsClient'

export default async function TransactionsPage() {
  const supabase = await createServerSupabaseClient()

  const [{ data: accounts }, { data: categories }] = await Promise.all([
    supabase.from('accounts').select('id, name, type, current_balance, currency, color, is_active').eq('is_active', true),
    supabase.from('categories').select('id, name, type, color, icon').eq('is_active', true).order('name'),
  ])

  return (
    <TransactionsClient
      initialAccounts={(accounts ?? []).map(a => ({ ...a, isActive: a.is_active }))}
      initialCategories={categories ?? []}
    />
  )
}
