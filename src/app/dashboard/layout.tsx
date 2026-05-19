import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/presentation/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <DashboardShell userName={profile?.name ?? undefined} userEmail={user.email ?? undefined}>
      {children}
    </DashboardShell>
  )
}
