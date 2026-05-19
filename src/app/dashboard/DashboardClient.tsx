'use client'

import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/presentation/lib/utils'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface Account {
  id: string
  name: string
  current_balance: number
  color: string
  type: string
}

interface CreditCard {
  id: string
  name: string
  current_bill: number
  credit_limit: number
  color: string
  flag: string
}

interface Transaction {
  type: string
  amount: number
  category_name?: string
  category_color?: string
  date: string
  status: string
}

interface TrendTransaction {
  type: string
  amount: number
  date: string
  status: string
}

interface UpcomingExpense {
  id: string
  description: string
  amount: number
  date: string
  category_name?: string
  category_color?: string
  account_name?: string
  status: string
}

interface RecentTransaction {
  id: string
  description: string
  amount: number
  type: string
  date: string
  category_name?: string
  category_color?: string
  account_name?: string
  status: string
}

interface Props {
  totalBalance: number
  income: number
  expense: number
  accounts: Account[]
  creditCards: CreditCard[]
  monthTransactions: Transaction[]
  trendTransactions: TrendTransaction[]
  upcomingExpenses: UpcomingExpense[]
  recentTransactions: RecentTransaction[]
  currentMonth: string
}

const PT_MONTHS: Record<number, string> = {
  0: 'Jan', 1: 'Fev', 2: 'Mar', 3: 'Abr', 4: 'Mai', 5: 'Jun',
  6: 'Jul', 7: 'Ago', 8: 'Set', 9: 'Out', 10: 'Nov', 11: 'Dez',
}

export function DashboardClient({
  totalBalance, income, expense, accounts, creditCards,
  monthTransactions, trendTransactions, upcomingExpenses,
  recentTransactions, currentMonth,
}: Props) {
  const result = income - expense

  // Expenses by category (donut chart)
  const categoryMap: Record<string, { name: string; color: string; value: number }> = {}
  for (const t of monthTransactions) {
    if (t.type === 'expense' && t.status === 'completed' && t.category_name) {
      const key = t.category_name
      if (!categoryMap[key]) {
        categoryMap[key] = { name: t.category_name, color: t.category_color || '#6B7280', value: 0 }
      }
      categoryMap[key].value += Number(t.amount)
    }
  }
  const categoryData = Object.values(categoryMap).sort((a, b) => b.value - a.value)

  // Monthly trend (last 6 months)
  const trendMap: Record<string, { month: string; receitas: number; despesas: number }> = {}
  for (const t of trendTransactions) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!trendMap[key]) {
      trendMap[key] = { month: PT_MONTHS[d.getMonth()], receitas: 0, despesas: 0 }
    }
    if (t.type === 'income') trendMap[key].receitas += Number(t.amount)
    if (t.type === 'expense') trendMap[key].despesas += Number(t.amount)
  }
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)

  // Account balances (horizontal bar)
  const accountData = accounts.map(a => ({
    name: a.name,
    saldo: Number(a.current_balance),
    fill: a.color || '#3B82F6',
  }))

  // Credit card bills
  const cardData = creditCards.map(c => ({
    name: c.name,
    fatura: Number(c.current_bill),
    limite: Number(c.credit_limit),
  }))

  // Upcoming expenses split by current vs next month
  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const upcomingThisMonth = upcomingExpenses.filter(e => e.date.startsWith(currentMonthStr))
  const upcomingNextMonth = upcomingExpenses.filter(e => !e.date.startsWith(currentMonthStr))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 capitalize">Resumo de {currentMonth}</p>
        </div>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nova Transação
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Saldo Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
        </div>
        <Link
          href="/dashboard/transactions/income"
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md cursor-pointer transition-shadow block"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receitas do Mês</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{formatCurrency(income)}</p>
        </Link>
        <Link
          href="/dashboard/transactions/expenses"
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md cursor-pointer transition-shadow block"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Despesas do Mês</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(expense)}</p>
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resultado do Mês</p>
          <p className={`mt-1 text-2xl font-bold ${result >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(result)}
          </p>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Despesas por Categoria */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Despesas por Categoria</h2>
          </div>
          <div className="p-4">
            {categoryData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-gray-400">Sem despesas neste mês</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 justify-center">
                  {categoryData.slice(0, 6).map((entry, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Balanço Mensal */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Balanço Mensal</h2>
          </div>
          <div className="p-4">
            {trendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-gray-400">Sem dados suficientes</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10B981" name="Receitas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Saldo por Conta */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Saldo por Conta</h2>
          </div>
          <div className="p-4">
            {accountData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-gray-400">Nenhuma conta ativa</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={accountData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="saldo" name="Saldo" radius={[0, 4, 4, 0]}>
                    {accountData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Faturas de Cartões */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Faturas de Cartões</h2>
          </div>
          <div className="p-4">
            {cardData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-gray-400">Nenhum cartão ativo</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="fatura" fill="#3B82F6" name="Fatura" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="limite" fill="#E5E7EB" name="Limite" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Despesas a Pagar */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Despesas a Pagar</h2>
        </div>
        {upcomingExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-400">Nenhuma despesa pendente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcomingThisMonth.length > 0 && (
              <>
                <div className="px-6 py-2 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Este mês</span>
                </div>
                {upcomingThisMonth.map(e => (
                  <div key={e.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: e.category_color || '#6B7280' }}
                      >
                        {e.category_name?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{e.description}</p>
                        <p className="text-xs text-gray-400">{e.category_name ?? 'Sem categoria'} · {formatDate(e.date)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-red-600">{formatCurrency(Number(e.amount))}</span>
                  </div>
                ))}
              </>
            )}
            {upcomingNextMonth.length > 0 && (
              <>
                <div className="px-6 py-2 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Próximo mês</span>
                </div>
                {upcomingNextMonth.map(e => (
                  <div key={e.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: e.category_color || '#6B7280' }}
                      >
                        {e.category_name?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{e.description}</p>
                        <p className="text-xs text-gray-400">{e.category_name ?? 'Sem categoria'} · {formatDate(e.date)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-red-600">{formatCurrency(Number(e.amount))}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Transações Recentes */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Transações Recentes</h2>
          <Link href="/dashboard/transactions" className="text-xs font-medium text-blue-600 hover:underline">Ver todas</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-400">Nenhuma transação recente</p>
            <Link href="/dashboard/transactions" className="mt-3 text-xs font-medium text-blue-600 hover:underline">Adicionar primeira transação</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: t.category_color || '#6B7280' }}
                  >
                    {t.category_name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-400">{t.category_name ?? 'Sem categoria'} · {t.account_name} · {formatDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {t.type === 'income'
                    ? <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    : <ArrowDownRight className="h-4 w-4 text-red-500" />}
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(Number(t.amount))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
