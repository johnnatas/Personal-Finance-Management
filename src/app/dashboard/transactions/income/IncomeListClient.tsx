'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/presentation/lib/utils'

interface Transaction {
  id: string
  description: string
  amount: number
  type: string
  date: string
  status: string
  category_name?: string
  category_color?: string
  account_name?: string
}

interface Props {
  transactions: Transaction[]
  total: number
  selectedMonth: string
}

export function IncomeListClient({ transactions, total, selectedMonth }: Props) {
  const router = useRouter()
  const [year, month] = selectedMonth.split('-').map(Number)
  const monthLabel = new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`/dashboard/transactions/income?month=${e.target.value}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="icon-btn" aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-[var(--color-fg-muted)]">Voltar</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">Receitas</h1>
          <p className="text-sm text-[var(--color-fg-muted)] capitalize">
            Total efetivado em {monthLabel}: <span className="font-semibold tabular-nums" style={{ color: 'var(--color-success)' }}>{formatCurrency(total)}</span>
          </p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="input sm:w-44"
        />
      </div>

      {/* List */}
      <div className="card">
        {transactions.length === 0 ? (
          <div className="empty">Nenhuma receita neste período</div>
        ) : (
          <div className="flex flex-col">
            {transactions.map(t => (
              <div key={t.id} className="tx-row">
                <div
                  className="tx-icon"
                  style={{ backgroundColor: t.category_color || 'var(--color-success)' }}
                >
                  <span className="text-xs font-bold">{t.category_name?.[0] ?? '?'}</span>
                </div>
                <div className="tx-meta">
                  <p className="title">{t.description}</p>
                  <p className="sub">{t.category_name ?? 'Sem categoria'} · {t.account_name} · {formatDate(t.date)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                  <span className="tx-amount income tabular-nums">{formatCurrency(Number(t.amount))}</span>
                  {t.status === 'pending' && (
                    <span className="chip warn ml-1">Pendente</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
