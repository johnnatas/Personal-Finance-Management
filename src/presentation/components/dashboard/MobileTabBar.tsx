'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, CreditCard, User, Plus } from 'lucide-react'

const tabs = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/dashboard/credit-cards', label: 'Cartões', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Perfil', icon: User },
] as const

export function MobileTabBar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-around rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 shadow-[var(--shadow-lg)] lg:hidden"
      aria-label="Navegação"
    >
      {tabs.slice(0, 2).map(tab => {
        const Icon = tab.icon
        const active = isActive(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium transition-colors ${
              active ? 'text-[var(--color-brand-700)]' : 'text-[var(--color-fg-faint)]'
            }`}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
            <span>{tab.label}</span>
          </Link>
        )
      })}

      <button
        onClick={() => router.push('/dashboard/transactions?new=1')}
        aria-label="Nova transação"
        className="-mt-8 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-brand-500)] text-[var(--color-brand-900)] shadow-[0_6px_16px_rgba(143,191,169,0.45)] transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" strokeWidth={2.4} />
      </button>

      {tabs.slice(2).map(tab => {
        const Icon = tab.icon
        const active = isActive(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium transition-colors ${
              active ? 'text-[var(--color-brand-700)]' : 'text-[var(--color-fg-faint)]'
            }`}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
