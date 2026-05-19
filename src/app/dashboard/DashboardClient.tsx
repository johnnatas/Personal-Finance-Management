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

const tooltipStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-soft)',
  borderRadius: 12,
  fontSize: 12,
  color: 'var(--color-fg)',
  boxShadow: '0 4px 16px rgba(5, 46, 27, 0.06)',
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
    fill: a.color || 'var(--color-brand-500)',
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
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-fg-muted)] capitalize">Resumo de {currentMonth}</p>
        </div>
        <Link href="/dashboard/transactions" className="btn btn-primary">
          <Plus className="h-4 w-4" /> Nova Transação
        </Link>
      </div>

      {/* Summary cards: Saldo Total (featured) + Receitas + Despesas + Resultado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card featured">
          <p className="stat-label">Saldo Total</p>
          <p className="stat-value">{formatCurrency(totalBalance)}</p>
        </div>
        <Link
          href="/dashboard/transactions/income"
          className="stat-card hover:-translate-y-0.5 transition-transform"
        >
          <p className="stat-label">Receitas do Mês</p>
          <p className="stat-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(income)}</p>
        </Link>
        <Link
          href="/dashboard/transactions/expenses"
          className="stat-card hover:-translate-y-0.5 transition-transform"
        >
          <p className="stat-label">Despesas do Mês</p>
          <p className="stat-value" style={{ color: 'var(--color-danger)' }}>{formatCurrency(expense)}</p>
        </Link>
        <div className="stat-card">
          <p className="stat-label">Resultado do Mês</p>
          <p className="stat-value" style={{ color: result >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {formatCurrency(result)}
          </p>
        </div>
      </div>

      {/* Charts row 1: Evolução (1.4) + Despesas por Categoria (1) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Receitas vs Despesas</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="empty">Sem dados suficientes</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-fg-muted)' }} stroke="var(--color-border)" />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-fg-muted)' }} stroke="var(--color-border)" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="receitas" fill="var(--color-success)" name="Receitas" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" fill="var(--color-danger)" name="Despesas" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Despesas por Categoria</h2>
          </div>
          {categoryData.length === 0 ? (
            <div className="empty">Sem despesas neste mês</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 justify-center">
                {categoryData.slice(0, 6).map((entry, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-[var(--color-fg-muted)]">{entry.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts row 2: Saldo por Conta + Faturas de Cartões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Saldo por Conta</h2>
          </div>
          {accountData.length === 0 ? (
            <div className="empty">Nenhuma conta ativa</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={accountData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-fg-muted)' }} stroke="var(--color-border)" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-fg-muted)' }} stroke="var(--color-border)" width={80} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                <Bar dataKey="saldo" name="Saldo" radius={[0, 6, 6, 0]}>
                  {accountData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Faturas de Cartões</h2>
          </div>
          {cardData.length === 0 ? (
            <div className="empty">Nenhum cartão ativo</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-fg-muted)' }} stroke="var(--color-border)" />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-fg-muted)' }} stroke="var(--color-border)" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="fatura" fill="var(--color-brand-500)" name="Fatura" radius={[6, 6, 0, 0]} />
                <Bar dataKey="limite" fill="var(--color-brand-200)" name="Limite" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row: Transações Recentes + Despesas a Pagar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Transações Recentes */}
        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Transações Recentes</h2>
            <Link href="/dashboard/transactions" className="card-action">Ver todas</Link>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="empty">
              Nenhuma transação recente
              <div className="mt-3">
                <Link href="/dashboard/transactions" className="text-xs font-medium text-brand-700 hover:underline">
                  Adicionar primeira transação
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {recentTransactions.map(t => (
                <div key={t.id} className="tx-row">
                  <div
                    className="tx-icon"
                    style={{ backgroundColor: t.category_color || 'var(--color-fg-faint)' }}
                  >
                    <span className="text-xs font-bold">{t.category_name?.[0] ?? '?'}</span>
                  </div>
                  <div className="tx-meta">
                    <p className="title">{t.description}</p>
                    <p className="sub">{t.category_name ?? 'Sem categoria'} · {t.account_name} · {formatDate(t.date)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.type === 'income'
                      ? <ArrowUpRight className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                      : <ArrowDownRight className="h-4 w-4" style={{ color: 'var(--color-danger)' }} />}
                    <span
                      className="tx-amount tabular-nums"
                      style={{ color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }}
                    >
                      {formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming / A Vencer */}
        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Despesas a Pagar</h2>
          </div>
          {upcomingExpenses.length === 0 ? (
            <div className="empty">Nenhuma despesa pendente</div>
          ) : (
            <div className="flex flex-col gap-1">
              {upcomingThisMonth.length > 0 && (
                <>
                  <div className="py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">Este mês</div>
                  {upcomingThisMonth.map(e => (
                    <div key={e.id} className="tx-row">
                      <div
                        className="tx-icon"
                        style={{ backgroundColor: e.category_color || 'var(--color-fg-faint)' }}
                      >
                        <span className="text-xs font-bold">{e.category_name?.[0] ?? '?'}</span>
                      </div>
                      <div className="tx-meta">
                        <p className="title">{e.description}</p>
                        <p className="sub">{e.category_name ?? 'Sem categoria'} · {formatDate(e.date)}</p>
                      </div>
                      <span className="tx-amount tabular-nums" style={{ color: 'var(--color-danger)' }}>
                        {formatCurrency(Number(e.amount))}
                      </span>
                    </div>
                  ))}
                </>
              )}
              {upcomingNextMonth.length > 0 && (
                <>
                  <div className="py-1 mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">Próximo mês</div>
                  {upcomingNextMonth.map(e => (
                    <div key={e.id} className="tx-row">
                      <div
                        className="tx-icon"
                        style={{ backgroundColor: e.category_color || 'var(--color-fg-faint)' }}
                      >
                        <span className="text-xs font-bold">{e.category_name?.[0] ?? '?'}</span>
                      </div>
                      <div className="tx-meta">
                        <p className="title">{e.description}</p>
                        <p className="sub">{e.category_name ?? 'Sem categoria'} · {formatDate(e.date)}</p>
                      </div>
                      <span className="tx-amount tabular-nums" style={{ color: 'var(--color-danger)' }}>
                        {formatCurrency(Number(e.amount))}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
