'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { useToast } from '@/presentation/components/ui/Toast'

interface UserProfile {
  id: string; name: string; phone?: string; avatar_url?: string
  currency: string; locale: string; timezone: string; theme: string
}
interface Props {
  user: { id: string; email: string }
  profile: UserProfile | null
}

export function ProfileClient({ user, profile }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: profile?.name ?? '',
    phone: profile?.phone ?? '',
    currency: profile?.currency ?? 'BRL',
    theme: profile?.theme ?? 'auto',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('users_profiles')
      .update({ name: profileForm.name, phone: profileForm.phone || null, currency: profileForm.currency, theme: profileForm.theme })
      .eq('id', user.id)
    setSavingProfile(false)
    if (error) { showToast('Erro ao salvar perfil', 'error'); return }
    showToast('Perfil atualizado com sucesso!')
    router.refresh()
  }

  const validatePassword = () => {
    const errs: Record<string, string> = {}
    if (!passwordForm.currentPassword) errs.currentPassword = 'Informe a senha atual'
    if (passwordForm.newPassword.length < 8) errs.newPassword = 'Mínimo 8 caracteres'
    if (!/[A-Z]/.test(passwordForm.newPassword)) errs.newPassword = 'Deve conter letra maiúscula'
    if (!/[0-9]/.test(passwordForm.newPassword)) errs.newPassword = 'Deve conter número'
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = 'As senhas não coincidem'
    return errs
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validatePassword()
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
    setSavingPassword(false)
    if (error) { showToast('Erro ao alterar senha: ' + error.message, 'error'); return }
    showToast('Senha alterada com sucesso!')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordErrors({})
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {[
          { key: 'profile' as const, label: 'Dados Pessoais', icon: User },
          { key: 'password' as const, label: 'Alterar Senha', icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
              activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-gray-700">Nome completo *</label>
                <input
                  required
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Moeda padrão</label>
                <select
                  value={profileForm.currency}
                  onChange={e => setProfileForm(f => ({ ...f, currency: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Tema</label>
                <select
                  value={profileForm.theme}
                  onChange={e => setProfileForm(f => ({ ...f, theme: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="auto">Automático</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <Save className="h-4 w-4" />
                {savingProfile ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="current-password" className="text-sm font-medium text-gray-700">Senha atual *</label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={e => { setPasswordForm(f => ({ ...f, currentPassword: e.target.value })); setPasswordErrors(ev => { const n = { ...ev }; delete n.currentPassword; return n }) }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="text-xs text-red-600">{passwordErrors.currentPassword}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-700">Nova senha *</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={e => { setPasswordForm(f => ({ ...f, newPassword: e.target.value })); setPasswordErrors(ev => { const n = { ...ev }; delete n.newPassword; return n }) }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="text-xs text-red-600">{passwordErrors.newPassword}</p>}
              <p className="text-xs text-gray-400">Mínimo 8 caracteres, 1 maiúscula e 1 número</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirmar senha *</label>
              <input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => { setPasswordForm(f => ({ ...f, confirmPassword: e.target.value })); setPasswordErrors(ev => { const n = { ...ev }; delete n.confirmPassword; return n }) }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              {passwordErrors.confirmPassword && <p className="text-xs text-red-600">{passwordErrors.confirmPassword}</p>}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <Lock className="h-4 w-4" />
                {savingPassword ? 'Alterando...' : 'Alterar senha'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
