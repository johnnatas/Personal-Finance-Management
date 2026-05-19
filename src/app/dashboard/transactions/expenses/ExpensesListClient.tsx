'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowDownRight } from 'lucide-react'
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

export function ExpensesListClient({ transactions, total, selectedMonth }: Props) {
  const router = useRouter()
  const [year, month] = selectedMonth.split('-').map(Number)
  const monthLabel = new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`/dashboard/transactions/expenses?month=${e.target.value}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="text-sm text-gray-500 capitalize">
            Total efetivado em {monthLabel}: <span className="font-semibold text-red-600">{formatCurrency(total)}</span>
          </p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-400">Nenhuma despesa neste período</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: t.category_color || '#EF4444' }}
                  >
                    {t.category_name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-400">
                      {t.category_name ?? 'Sem categoria'} · {t.account_name} · {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(Number(t.amount))}</span>
                  {t.status === 'pending' && (
                    <span className="ml-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Pendente</span>
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
