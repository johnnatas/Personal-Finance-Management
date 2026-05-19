'use client'

import { useState } from 'react'
import { Menu, TrendingUp } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ToastProvider } from '@/presentation/components/ui/Toast'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Mobile header */}
          <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900">Dindin</span>
            </div>
            <div className="w-9" />
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 pb-8 lg:p-6">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
