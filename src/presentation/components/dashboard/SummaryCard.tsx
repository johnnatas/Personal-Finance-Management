import { cn } from '@/presentation/lib/utils'
import { formatCurrency } from '@/presentation/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'

type Variant = 'income' | 'expense' | 'balance' | 'savings'

const variants: Record<Variant, { icon: React.ElementType; bg: string; text: string; iconColor: string }> = {
  income: { icon: TrendingUp, bg: 'bg-emerald-50', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
  expense: { icon: TrendingDown, bg: 'bg-red-50', text: 'text-red-700', iconColor: 'text-red-500' },
  balance: { icon: Wallet, bg: 'bg-blue-50', text: 'text-blue-700', iconColor: 'text-blue-500' },
  savings: { icon: Target, bg: 'bg-purple-50', text: 'text-purple-700', iconColor: 'text-purple-500' },
}

interface SummaryCardProps {
  title: string
  amount: number
  variant: Variant
  currency?: string
  change?: number
}

export function SummaryCard({ title, amount, variant, currency = 'BRL', change }: SummaryCardProps) {
  const { icon: Icon, bg, text, iconColor } = variants[variant]

  return (
    <div className={cn('rounded-xl p-5 shadow-sm border border-transparent', bg)} data-testid="summary-card">
      <div className="flex items-center justify-between">
        <p className={cn('text-sm font-medium', text)}>{title}</p>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <p className={cn('mt-2 text-2xl font-bold', text)}>
        {formatCurrency(amount, currency)}
      </p>
      {change !== undefined && (
        <p className={cn('mt-1 text-xs', change >= 0 ? 'text-emerald-600' : 'text-red-600')}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs mês anterior
        </p>
      )}
    </div>
  )
}
