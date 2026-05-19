import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { InvestmentsClient } from './InvestmentsClient'

export default async function InvestmentsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: investments } = await supabase
    .from('investments')
    .select('id, name, type, purchase_value, current_value, quantity, purchase_date, currency, institution, notes')
    .order('created_at', { ascending: false })
  return <InvestmentsClient initialInvestments={investments ?? []} />
}
