import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Sidebar } from '@/presentation/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') ?? headersList.get('x-pathname') ?? ''

  if (!pathname.includes('/dashboard/accounts')) {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .eq('is_active', true)
      .limit(1)

    if (!accounts || accounts.length === 0) {
      redirect('/dashboard/accounts?onboarding=true')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
