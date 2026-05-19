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
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">Meu Perfil</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">{user.email}</p>
      </div>

      {/* Tabs (segments) */}
      <div className="segments w-full">
        {[
          { key: 'profile' as const, label: 'Dados Pessoais', icon: User },
          { key: 'password' as const, label: 'Alterar Senha', icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 ${activeTab === key ? 'active' : ''}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="field sm:col-span-2">
                <label className="label">Nome completo *</label>
                <input
                  required
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Seu nome"
                  className="input"
                />
              </div>
              <div className="field">
                <label className="label">Telefone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="input"
                />
              </div>
              <div className="field">
                <label className="label">Moeda padrão</label>
                <select
                  value={profileForm.currency}
                  onChange={e => setProfileForm(f => ({ ...f, currency: e.target.value }))}
                  className="select"
                >
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Tema</label>
                <select
                  value={profileForm.theme}
                  onChange={e => setProfileForm(f => ({ ...f, theme: e.target.value }))}
                  className="select"
                >
                  <option value="auto">Automático</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingProfile} className="btn btn-primary">
                <Save className="h-4 w-4" />
                {savingProfile ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="field">
              <label htmlFor="current-password" className="label">Senha atual *</label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={e => { setPasswordForm(f => ({ ...f, currentPassword: e.target.value })); setPasswordErrors(ev => { const n = { ...ev }; delete n.currentPassword; return n }) }}
                  className="input pr-10"
                />
                <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-faint)]">
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>}
            </div>
            <div className="field">
              <label htmlFor="new-password" className="label">Nova senha *</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={e => { setPasswordForm(f => ({ ...f, newPassword: e.target.value })); setPasswordErrors(ev => { const n = { ...ev }; delete n.newPassword; return n }) }}
                  className="input pr-10"
                />
                <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-faint)]">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>}
              <p className="mt-1 text-xs text-[var(--color-fg-faint)]">Mínimo 8 caracteres, 1 maiúscula e 1 número</p>
            </div>
            <div className="field">
              <label htmlFor="confirm-password" className="label">Confirmar senha *</label>
              <input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => { setPasswordForm(f => ({ ...f, confirmPassword: e.target.value })); setPasswordErrors(ev => { const n = { ...ev }; delete n.confirmPassword; return n }) }}
                className="input"
              />
              {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>}
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingPassword} className="btn btn-primary">
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
