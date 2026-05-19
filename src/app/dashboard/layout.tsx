import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/presentation/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return <DashboardShell>{children}</DashboardShell>
}
