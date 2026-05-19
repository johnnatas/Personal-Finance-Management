'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, ArrowUpRight, ArrowDownLeft, Bell, Eye, EyeOff,
  Send, QrCode, TrendingUp, TrendingDown,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/presentation/lib/utils'
import { CategoryIcon } from '@/presentation/components/ui/CategoryIcon'
import {
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
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
  userName?: string
}

const PT_MONTHS: Record<number, string> = {
  0: 'Jan', 1: 'Fev', 2: 'Mar', 3: 'Abr', 4: 'Mai', 5: 'Jun',
  6: 'Jul', 7: 'Ago', 8: 'Set', 9: 'Out', 10: 'Nov', 11: 'Dez',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Custom tooltip styled per design
interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: Array<{ name?: string; value?: number | string; color?: string }>
}
function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3 py-2 text-sm shadow-md">
      {label != null && <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 tabular-nums">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: String(entry.color) }} />
          <span className="text-xs text-[var(--color-fg-muted)]">{entry.name}</span>
          <span className="text-xs font-semibold text-[var(--color-fg)]">{formatCurrency(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardClient({
  totalBalance, income, expense, accounts,
  monthTransactions, trendTransactions, upcomingExpenses,
  recentTransactions, currentMonth, userName,
}: Props) {
  const [showBalance, setShowBalance] = useState(true)

  const result = income - expense
  const incomeCount = monthTransactions.filter(t => t.type === 'income' && t.status === 'completed').length
  const expenseCount = monthTransactions.filter(t => t.type === 'expense' && t.status === 'completed').length

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
  const categoryTotal = categoryData.reduce((s, c) => s + c.value, 0)

  // Monthly trend
  const trendMap: Record<string, { month: string; receitas: number; despesas: number; saldo: number }> = {}
  for (const t of trendTransactions) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (!trendMap[key]) {
      trendMap[key] = { month: PT_MONTHS[d.getMonth()], receitas: 0, despesas: 0, saldo: 0 }
    }
    if (t.type === 'income') trendMap[key].receitas += Number(t.amount)
    if (t.type === 'expense') trendMap[key].despesas += Number(t.amount)
  }
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ ...v, saldo: v.receitas - v.despesas }))

  // Cumulative balance for the area chart (approximation: running total of net)
  let running = 0
  const evolutionData = trendData.map(d => {
    running += d.saldo
    return { month: d.month, saldo: running }
  })

  // Account balances bar list
  const accountList = accounts.map(a => ({
    name: a.name,
    saldo: Number(a.current_balance),
    color: a.color || 'var(--color-brand-500)',
  }))
  const maxAccountBalance = accountList.reduce((m, a) => Math.max(m, a.saldo), 0) || 1

  // Upcoming
  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const upcomingThisMonth = upcomingExpenses.filter(e => e.date.startsWith(currentMonthStr))
  const upcomingNextMonth = upcomingExpenses.filter(e => !e.date.startsWith(currentMonthStr))

  const greeting = getGreeting()
  const displayName = userName ?? 'Você'
  const initials = getInitials(displayName)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Mobile greeting */}
      <div className="flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-300 text-[13px] font-bold text-brand-900">
            {initials}
          </div>
          <div>
            <div className="text-xs text-[var(--color-fg-muted)]">{greeting},</div>
            <div className="text-[15px] font-bold text-[var(--color-fg)]">{displayName}</div>
          </div>
        </div>
        <button className="icon-btn relative" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-fg)]">
            Olá, {displayName} <span aria-hidden>👋</span>
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] capitalize">Resumo de {currentMonth}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip capitalize">{currentMonth}</span>
          <Link href="/dashboard/transactions?new=1" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Nova Transação
          </Link>
        </div>
      </div>

      {/* Mobile hero balance */}
      <div className="hero-balance lg:hidden">
        <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hb-label">Saldo total</div>
          <button
            type="button"
            onClick={() => setShowBalance(v => !v)}
            className="opacity-70 hover:opacity-100"
            aria-label={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
            style={{ color: 'inherit' }}
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        <div className="hb-value">{showBalance ? formatCurrency(totalBalance) : 'R$ ••••••'}</div>
        <div className="hb-actions">
          <Link href="/dashboard/transactions?new=1" aria-label="Enviar">
            <Send className="h-4 w-4" /> Enviar
          </Link>
          <Link href="/dashboard/transactions?new=1" aria-label="Receber">
            <ArrowDownLeft className="h-4 w-4" /> Receber
          </Link>
          <Link href="/dashboard/transactions?new=1" aria-label="Pix">
            <QrCode className="h-4 w-4" /> Pix
          </Link>
          <Link href="/dashboard/transactions?new=1" aria-label="Depositar">
            <Plus className="h-4 w-4" /> Depositar
          </Link>
        </div>
      </div>

      {/* Mobile quick stats */}
      <div className="grid grid-cols-2 gap-2.5 lg:hidden">
        <div className="card" style={{ padding: 14 }}>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="grid place-items-center rounded-[10px]"
              style={{ width: 30, height: 30, background: 'rgba(34,197,94,0.12)', color: 'var(--color-success)' }}
            >
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </div>
            <div className="text-[11px] text-[var(--color-fg-muted)]">Receitas</div>
          </div>
          <div className="text-[17px] font-bold tabular-nums" style={{ color: 'var(--color-success)' }}>
            {formatCurrency(income)}
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="grid place-items-center rounded-[10px]"
              style={{ width: 30, height: 30, background: 'rgba(239,68,68,0.12)', color: 'var(--color-danger)' }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
            <div className="text-[11px] text-[var(--color-fg-muted)]">Despesas</div>
          </div>
          <div className="text-[17px] font-bold tabular-nums" style={{ color: 'var(--color-danger)' }}>
            {formatCurrency(expense)}
          </div>
        </div>
      </div>

      {/* Desktop summary cards */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
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
          <span className="stat-delta up">
            <TrendingUp className="h-3.5 w-3.5" /> {incomeCount} entradas
          </span>
        </Link>
        <Link
          href="/dashboard/transactions/expenses"
          className="stat-card hover:-translate-y-0.5 transition-transform"
        >
          <p className="stat-label">Despesas do Mês</p>
          <p className="stat-value" style={{ color: 'var(--color-danger)' }}>{formatCurrency(expense)}</p>
          <span className="stat-delta down">
            <TrendingDown className="h-3.5 w-3.5" /> {expenseCount} saídas
          </span>
        </Link>
        <div className="stat-card">
          <p className="stat-label">Resultado do Mês</p>
          <p className="stat-value" style={{ color: result >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {formatCurrency(result)}
          </p>
        </div>
      </div>

      {/* Charts row 1: Evolução + Donut */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Evolução do Saldo</h2>
            <span className="chip">6M</span>
          </div>
          {evolutionData.length === 0 ? (
            <div className="empty">Sem dados suficientes</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={evolutionData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border-soft)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-fg-faint)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-fg-faint)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="var(--color-brand-500)" strokeWidth={2} fill="url(#gradSaldo)" />
              </AreaChart>
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
              <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">Total</div>
                    <div className="text-base font-bold tabular-nums text-[var(--color-fg)]">{formatCurrency(categoryTotal)}</div>
                  </div>
                </div>
              </div>
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

      {/* Charts row 2: Receitas vs Despesas + Saldo por Conta (BarList) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Receitas vs Despesas</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="empty">Sem dados suficientes</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--color-fg-faint)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-fg-faint)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="receitas" name="Receitas" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Saldo por Conta</h2>
          </div>
          {accountList.length === 0 ? (
            <div className="empty">Nenhuma conta ativa</div>
          ) : (
            <div className="flex flex-col gap-3">
              {accountList.map(a => {
                const pct = Math.max(0, (a.saldo / maxAccountBalance) * 100)
                return (
                  <div key={a.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                        <span className="font-medium text-[var(--color-fg)]">{a.name}</span>
                      </div>
                      <span className="tabular-nums font-semibold text-[var(--color-fg)]">{formatCurrency(a.saldo)}</span>
                    </div>
                    <div className="bar">
                      <div className="fill" style={{ width: `${Math.min(pct, 100)}%`, background: a.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent + Upcoming */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">Transações Recentes</h2>
            <Link href="/dashboard/transactions" className="card-action">Ver todas</Link>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="empty">
              Nenhuma transação recente
              <div className="mt-3">
                <Link href="/dashboard/transactions?new=1" className="text-xs font-medium text-brand-700 hover:underline">
                  Adicionar primeira transação
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {recentTransactions.map(t => (
                <div key={t.id} className="tx-row">
                  <CategoryIcon
                    name={t.category_name}
                    color={t.category_color || 'var(--color-fg-faint)'}
                    size={40}
                    radius={12}
                  />
                  <div className="tx-meta">
                    <p className="title">{t.description}</p>
                    <p className="sub">{t.category_name ?? 'Sem categoria'} · {t.account_name} · {formatDate(t.date)}</p>
                  </div>
                  <span
                    className="tx-amount tabular-nums"
                    style={{ color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-fg)' }}
                  >
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(Number(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-hd">
            <h2 className="card-title">A Vencer</h2>
          </div>
          {upcomingExpenses.length === 0 ? (
            <div className="empty">Nenhuma despesa pendente</div>
          ) : (
            <div className="flex flex-col gap-2">
              {[...upcomingThisMonth, ...upcomingNextMonth].map(e => {
                const d = new Date(e.date)
                const day = String(d.getDate()).padStart(2, '0')
                const month = PT_MONTHS[d.getMonth()]
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: 'rgba(45,74,62,0.08)' }}
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--color-surface)] text-center">
                      <span className="text-[11px] font-bold leading-none text-[var(--color-fg)]">{day}</span>
                      <span className="text-[9px] uppercase tracking-wider leading-none text-[var(--color-fg-muted)]">{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-fg)] truncate">{e.description}</p>
                      <p className="text-[11px] text-[var(--color-fg-muted)]">Vence {formatDate(e.date)}</p>
                    </div>
                    <span className="tx-amount tabular-nums" style={{ color: 'var(--color-danger)' }}>
                      {formatCurrency(Number(e.amount))}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
