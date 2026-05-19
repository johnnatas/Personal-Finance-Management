'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, Wallet, CreditCard,
  PieChart, Target, TrendingUp, LogOut, X, User,
} from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

const mainNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/dashboard/accounts', label: 'Contas', icon: Wallet },
  { href: '/dashboard/credit-cards', label: 'Cartões', icon: CreditCard },
]

const planningNav: NavItem[] = [
  { href: '/dashboard/budgets', label: 'Orçamentos', icon: PieChart },
  { href: '/dashboard/goals', label: 'Metas', icon: Target },
  { href: '/dashboard/investments', label: 'Investimentos', icon: TrendingUp },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  userName?: string
  userEmail?: string
  transactionsBadge?: number
  cardsBadge?: number
}

function NavLink({ item, pathname, onClose, badge }: { item: NavItem; pathname: string; onClose?: () => void; badge?: number }) {
  const isActive = item.href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname.startsWith(item.href)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-[var(--color-brand-300)] text-[var(--color-brand-900)]'
          : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-fg)]'
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
      <span className="flex-1">{item.label}</span>
      {badge != null && badge > 0 && (
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
          isActive
            ? 'bg-[var(--color-brand-900)]/15 text-[var(--color-brand-900)]'
            : 'bg-[var(--color-surface-muted)] text-[var(--color-fg-muted)]'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar({ isOpen = true, onClose, userName, userEmail, transactionsBadge, cardsBadge }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = (userName ?? userEmail ?? 'U')
    .split(' ')
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const navContent = (
    <div className="flex h-full flex-col bg-[var(--color-surface)] px-3 py-5">
      {/* Logo */}
      <div className="flex items-center justify-between px-2 pb-5">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <Image src="/dindin-mark.png" alt="Dindin" width={32} height={32} priority className="h-8 w-8 rounded-[10px] object-contain" />
          <span className="text-[17px] font-bold tracking-tight text-[var(--color-fg)]">Dindin</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="icon-btn lg:hidden" aria-label="Fechar menu">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Menu Principal */}
      <div className="px-2 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-fg-faint)]">
        Menu Principal
      </div>
      <nav className="flex flex-col gap-0.5">
        {mainNav.map(item => {
          let badge: number | undefined
          if (item.href === '/dashboard/transactions') badge = transactionsBadge
          if (item.href === '/dashboard/credit-cards') badge = cardsBadge
          return <NavLink key={item.href} item={item} pathname={pathname} onClose={onClose} badge={badge} />
        })}
      </nav>

      {/* Planejamento */}
      <div className="px-2 pb-1.5 pt-4 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-fg-faint)]">
        Planejamento
      </div>
      <nav className="flex flex-col gap-0.5">
        {planningNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} onClose={onClose} />)}
      </nav>

      {/* User card + signout */}
      <div className="mt-auto pt-4">
        <NavLink
          item={{ href: '/dashboard/profile', label: 'Perfil', icon: User }}
          pathname={pathname}
          onClose={onClose}
        />
        <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-[var(--color-surface-muted)] p-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-brand-300)] text-[13px] font-semibold text-[var(--color-brand-900)]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-[var(--color-fg)]">{userName ?? 'Usuário'}</div>
            <div className="truncate text-[11px] text-[var(--color-fg-faint)]">{userEmail ?? ''}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-danger)]"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-[var(--color-border-soft)] lg:flex lg:flex-col">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <aside className="relative flex w-72 flex-col shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
