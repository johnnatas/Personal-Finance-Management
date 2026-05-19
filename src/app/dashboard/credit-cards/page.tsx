import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { CreditCardsClient } from './CreditCardsClient'

export default async function CreditCardsPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: cards }, { data: accounts }] = await Promise.all([
    supabase.from('credit_cards').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('accounts').select('id, name, type').eq('is_active', true).in('type', ['checking_account', 'savings_account']),
  ])
  return <CreditCardsClient initialCards={cards ?? []} accounts={accounts ?? []} />
}
