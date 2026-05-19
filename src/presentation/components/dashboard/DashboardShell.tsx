'use client'

import { useState } from 'react'
import { Menu, TrendingUp } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ToastProvider } from '@/presentation/components/ui/Toast'

interface DashboardShellProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
}

export function DashboardShell({ children, userName, userEmail }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userName={userName}
          userEmail={userEmail}
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
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-[10px] bg-[var(--color-brand-500)]">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--color-brand-900)]" strokeWidth={2.4} />
              </div>
              <span className="text-[15px] font-bold text-[var(--color-fg)]">Dindin</span>
            </div>
            <div className="w-9" />
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 pb-24 lg:p-7 lg:pb-14">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
