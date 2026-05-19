import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/presentation/components/dashboard/DashboardShell'
import { getFirstDayOfMonth, getLastDayOfMonth } from '@/presentation/lib/utils'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const now = new Date()
  const monthStart = getFirstDayOfMonth(now)
  const monthEnd = getLastDayOfMonth(now)

  const [{ data: profile }, txCount, cardCount] = await Promise.all([
    supabase.from('users_profiles').select('name').eq('id', user.id).maybeSingle(),
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('date', monthStart)
      .lte('date', monthEnd),
    supabase
      .from('credit_cards')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  return (
    <DashboardShell
      userName={profile?.name ?? undefined}
      userEmail={user.email ?? undefined}
      transactionsBadge={txCount.count ?? undefined}
      cardsBadge={cardCount.count ?? undefined}
    >
      {children}
    </DashboardShell>
  )
}
