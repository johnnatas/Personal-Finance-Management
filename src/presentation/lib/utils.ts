import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string, locale = 'pt-BR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getFirstDayOfMonth(date = new Date()): string {
  return formatDateISO(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function getLastDayOfMonth(date = new Date()): string {
  return formatDateISO(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}
