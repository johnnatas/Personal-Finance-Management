import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { AccountsClient } from './AccountsClient'

export default async function AccountsPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: accounts }, { data: creditCards }] = await Promise.all([
    supabase
      .from('accounts')
      .select('id, name, type, current_balance, initial_balance, currency, color, institution, is_active')
      .order('created_at', { ascending: true }),
    supabase
      .from('credit_cards')
      .select('id, name, credit_limit, current_bill, color, flag, is_active')
      .eq('is_active', true),
  ])

  return <AccountsClient initialAccounts={accounts ?? []} initialCreditCards={creditCards ?? []} />
}
