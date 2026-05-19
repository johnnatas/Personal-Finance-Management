import { createServerSupabaseClient } from '@/infrastructure/supabase/server'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <ProfileClient user={{ id: user!.id, email: user!.email ?? '' }} profile={profile} />
}
