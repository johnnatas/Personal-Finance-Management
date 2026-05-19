'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, Bell } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { MobileTabBar } from './MobileTabBar'
import { ToastProvider } from '@/presentation/components/ui/Toast'

interface DashboardShellProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
  transactionsBadge?: number
  cardsBadge?: number
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  transactionsBadge,
  cardsBadge,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userName={userName}
          userEmail={userEmail}
          transactionsBadge={transactionsBadge}
          cardsBadge={cardsBadge}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="icon-btn"
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/dindin-mark.png" alt="Dindin" width={28} height={28} priority className="h-7 w-7 object-contain" />
              <span className="text-[15px] font-bold text-[var(--color-fg)]">Dindin</span>
            </Link>
            <button className="icon-btn relative" aria-label="Notificações">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-brand-500)]" />
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 pb-28 lg:p-7 lg:pb-14">{children}</div>
          </main>
        </div>
      </div>

      <MobileTabBar />
    </ToastProvider>
  )
}
