'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Wallet, Building2, CreditCard, TrendingUp, Banknote, MoreHorizontal, Send, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'
import { formatCurrency } from '@/presentation/lib/utils'
import { ConfirmModal } from '@/presentation/components/ui/ConfirmModal'
import { Modal } from '@/presentation/components/ui/Modal'
import { CurrencyInput } from '@/presentation/components/ui/CurrencyInput'
import { TransactionForm } from '@/presentation/components/transactions/TransactionForm'
import { useToast } from '@/presentation/components/ui/Toast'

const ACCOUNT_TYPES = [
  { value: 'checking_account', label: 'Conta Corrente', icon: Building2 },
  { value: 'savings_account', label: 'Poupança', icon: Wallet },
  { value: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard },
  { value: 'investment', label: 'Investimentos', icon: TrendingUp },
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'other', label: 'Outro', icon: MoreHorizontal },
]

const COLORS = ['#8FBFA9','#A8D5BC','#22C55E','#F59E0B','#EF4444','#EC4899','#6366F1','#14B8A6']

interface Account {
  id: string; name: string; type: string; current_balance: number
  initial_balance: number; currency: string; color: string
  institution?: string; is_active: boolean
}

interface CreditCardSummary {
  id: string; name: string; credit_limit: number; current_bill: number; color: string; flag: string; is_active: boolean
}

interface Props {
  initialAccounts: Account[]
  initialCreditCards?: CreditCardSummary[]
}

function AccountTypeLabel({ type }: { type: string }) {
  return <>{ACCOUNT_TYPES.find(t => t.value === type)?.label ?? type}</>
}

function AccountsInner({ initialAccounts, initialCreditCards = [] }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const [accounts, setAccounts] = useState(initialAccounts)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<Account | null>(null)
  const [transferAccount, setTransferAccount] = useState<Account | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const emptyForm = { name: '', type: 'checking_account', initial_balance: '', currency: 'BRL', color: '#8FBFA9', institution: '' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { setAccounts(initialAccounts) }, [initialAccounts])

  // Close dropdown on outside click
  useEffect(() => {
    if (!openMenuId) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openMenuId])

  // Pre-fill form when editing
  useEffect(() => {
    if (editTarget) {
      setForm({
        name: editTarget.name,
        type: editTarget.type,
        initial_balance: String(editTarget.initial_balance),
        currency: editTarget.currency,
        color: editTarget.color,
        institution: editTarget.institution ?? '',
      })
      setShowForm(true)
    }
  }, [editTarget])

  const totalBalance = accounts.filter(a => a.is_active).reduce((s, a) => s + Number(a.current_balance), 0)

  // Credit card aggregates
  const activeCreditCards = initialCreditCards.filter(c => c.is_active)
  const totalCreditLimit = activeCreditCards.reduce((s, c) => s + Number(c.credit_limit), 0)
  const totalCreditUsed = activeCreditCards.reduce((s, c) => s + Number(c.current_bill), 0)
  const totalCreditAvailable = totalCreditLimit - totalCreditUsed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      showToast('Sessão expirada. Faça login novamente.', 'error')
      return
    }

    if (editTarget) {
      await supabase.from('accounts').update({
        name: form.name,
        type: form.type,
        color: form.color,
        institution: form.institution || null,
      }).eq('id', editTarget.id)
      setEditTarget(null)
      setShowForm(false)
      setForm(emptyForm)
      setSaving(false)
      showToast('Conta atualizada!')
      router.refresh()
      return
    }

    const balance = parseFloat(form.initial_balance) || 0
    await supabase.from('accounts').insert({
      user_id: user.id,
      name: form.name, type: form.type,
      initial_balance: balance, current_balance: balance,
      currency: form.currency, color: form.color,
      institution: form.institution || null, is_active: true,
    })
    setShowForm(false)
    setForm(emptyForm)
    setSaving(false)
    showToast('Conta criada com sucesso!')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setOpenMenuId(null)
    setDeleteTarget(id)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const supabase = createClient()
    await supabase.from('accounts').update({ is_active: false }).eq('id', deleteTarget)
    setDeleteTarget(null)
    showToast('Conta desativada', 'info')
    router.refresh()
  }

  const handleTransferSubmit = async (data: Record<string, unknown>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { showToast('Sessão expirada', 'error'); return }
    const { error: err } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'transfer',
      amount: data.amount,
      description: data.description,
      date: data.date,
      account_id: data.accountId,
      destination_account_id: data.destinationAccountId || null,
      status: data.status,
      is_recurrent: false,
      tags: [],
    })
    if (err) throw new Error(err.message)
    setTransferAccount(null)
    showToast('Transferência registrada!')
    router.refresh()
  }

  // Map accounts to the shape TransactionForm expects
  const accountsForForm = accounts.filter(a => a.is_active).map(a => ({
    ...a,
    isActive: a.is_active,
    currentBalance: Number(a.current_balance),
  }))

  const isEditing = !!editTarget

  return (
    <div className="space-y-6">
      {isOnboarding && (
        <div className="card flex items-start gap-3" style={{ background: 'var(--color-brand-100)', borderColor: 'var(--color-brand-300)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-300 shrink-0">
            <Wallet className="h-4 w-4 text-brand-900" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-900">Bem-vindo! Vamos configurar sua primeira conta</p>
            <p className="text-xs text-brand-800/80 mt-0.5">Adicione sua conta bancária, carteira ou cartão de crédito para começar a registrar suas finanças.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">Contas</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Saldo total: <span className="font-semibold text-[var(--color-fg)] tabular-nums">{formatCurrency(totalBalance)}</span>
          </p>
        </div>
        <button onClick={() => { setEditTarget(null); setForm(emptyForm); setShowForm(true) }} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Nova Conta
        </button>
      </div>

      {/* Credit card stats */}
      {activeCreditCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="stat-label">Limite Total</p>
            <p className="stat-value tabular-nums">{formatCurrency(totalCreditLimit)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Fatura Atual</p>
            <p className="stat-value tabular-nums" style={{ color: 'var(--color-danger)' }}>{formatCurrency(totalCreditUsed)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Disponível</p>
            <p className="stat-value tabular-nums" style={{ color: 'var(--color-success)' }}>{formatCurrency(Math.max(totalCreditAvailable, 0))}</p>
          </div>
        </div>
      )}

      {/* Account form modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditTarget(null); setForm(emptyForm) }} title={isEditing ? 'Editar Conta' : 'Nova Conta'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="field">
              <label className="label">Nome da conta *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Nubank" className="input" />
            </div>
            <div className="field">
              <label className="label">Tipo *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="select">
                {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {!isEditing && (
              <div className="field">
                <label className="label">Saldo inicial</label>
                <CurrencyInput
                  value={form.initial_balance}
                  onChange={(numericValue) => setForm(f => ({ ...f, initial_balance: numericValue }))}
                  placeholder="0,00"
                  className="input"
                />
              </div>
            )}
            {isEditing && (
              <div className="field">
                <label className="label">Saldo inicial</label>
                <input
                  value={formatCurrency(parseFloat(form.initial_balance) || 0)}
                  readOnly
                  className="input opacity-60 cursor-not-allowed"
                />
              </div>
            )}
            <div className="field">
              <label className="label">Instituição</label>
              <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                placeholder="Ex: Banco do Brasil" className="input" />
            </div>
          </div>
          <div className="field">
            <label className="label">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: form.color === c ? 'var(--color-brand-900)' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditTarget(null); setForm(emptyForm) }} className="btn btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar Conta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer modal */}
      <Modal open={!!transferAccount} onClose={() => setTransferAccount(null)} title="Nova Transferência">
        {transferAccount && (
          <TransactionForm
            accounts={accountsForForm}
            categories={[]}
            onSubmit={handleTransferSubmit as Parameters<typeof TransactionForm>[0]['onSubmit']}
            onCancel={() => setTransferAccount(null)}
            defaultValues={{ type: 'transfer', accountId: transferAccount.id }}
          />
        )}
      </Modal>

      {/* Empty state */}
      {accounts.length === 0 && !showForm && (
        <div className="card flex flex-col items-center justify-center border-dashed border-2 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <Wallet className="h-8 w-8 text-brand-700" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-[var(--color-fg)]">Nenhuma conta cadastrada</h3>
          <p className="mb-6 text-sm text-[var(--color-fg-muted)]">Adicione sua primeira conta para começar a controlar suas finanças.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Adicionar Conta
          </button>
        </div>
      )}

      {/* Account cards */}
      {accounts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.filter(a => a.is_active).map(account => {
            const initial = (account.name?.[0] ?? '?').toUpperCase()
            const isMenuOpen = openMenuId === account.id
            return (
              <div
                key={account.id}
                className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] overflow-visible hover:shadow-md transition-shadow"
              >
                <div
                  className="p-5 rounded-t-2xl"
                  style={{ background: `color-mix(in oklab, ${account.color} 16%, var(--color-surface))` }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-base font-bold text-white"
                      style={{ backgroundColor: account.color }}
                    >
                      {initial}
                    </div>
                    {/* "..." dropdown menu */}
                    <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : account.id)}
                        className="icon-btn"
                        title="Opções"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-10 z-20 min-w-[140px] rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] shadow-lg py-1"
                        >
                          <button
                            onClick={() => { setOpenMenuId(null); setEditTarget(account) }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)] transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-danger)] hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
                      <AccountTypeLabel type={account.type} />
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-[var(--color-fg)]">{account.name}</p>
                    {account.institution && <p className="text-xs text-[var(--color-fg-faint)]">{account.institution}</p>}
                  </div>
                </div>

                <div className="p-5 border-t border-[var(--color-border-soft)] bg-[var(--color-surface)] rounded-b-2xl space-y-3">
                  <div>
                    <p className="text-xs text-[var(--color-fg-muted)]">Saldo atual</p>
                    <p
                      className="text-xl font-bold tabular-nums"
                      style={{ color: Number(account.current_balance) >= 0 ? 'var(--color-fg)' : 'var(--color-danger)' }}
                    >
                      {formatCurrency(account.current_balance)}
                    </p>
                  </div>
                  <button
                    onClick={() => setTransferAccount(account)}
                    className="btn btn-ghost w-full text-sm py-2"
                    style={{ borderRadius: 10 }}
                  >
                    <Send className="h-3.5 w-3.5" /> Transferir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Desativar conta"
        message="Tem certeza que deseja desativar esta conta?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export function AccountsClient({ initialAccounts, initialCreditCards }: Props) {
  return (
    <Suspense fallback={null}>
      <AccountsInner initialAccounts={initialAccounts} initialCreditCards={initialCreditCards} />
    </Suspense>
  )
}
