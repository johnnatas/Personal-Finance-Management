import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { AccountsClient } from './AccountsClient'

export default async function AccountsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name, type, current_balance, initial_balance, currency, color, institution, is_active')
    .order('created_at', { ascending: true })

  return <AccountsClient initialAccounts={accounts ?? []} />
}
