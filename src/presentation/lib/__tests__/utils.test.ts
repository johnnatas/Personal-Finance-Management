import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, getFirstDayOfMonth, getLastDayOfMonth } from '../utils'

describe('utils', () => {
  describe('formatCurrency', () => {
    it('should format BRL currency', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1.234,56')
    })

    it('should format USD currency', () => {
      const result = formatCurrency(1000, 'USD', 'en-US')
      expect(result).toContain('1,000.00')
    })

    it('should format zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0,00')
    })
  })

  describe('formatDate', () => {
    it('should format date in pt-BR', () => {
      const result = formatDate(new Date('2026-05-15'))
      expect(result).toBe('15/05/2026')
    })

    it('should format string date', () => {
      const result = formatDate('2026-01-01')
      expect(result).toBe('01/01/2026')
    })
  })

  describe('getFirstDayOfMonth', () => {
    it('should return first day of current month', () => {
      const date = new Date('2026-05-15')
      expect(getFirstDayOfMonth(date)).toBe('2026-05-01')
    })
  })

  describe('getLastDayOfMonth', () => {
    it('should return last day of current month', () => {
      const date = new Date('2026-05-15')
      expect(getLastDayOfMonth(date)).toBe('2026-05-31')
    })

    it('should handle february', () => {
      const date = new Date('2026-02-01')
      expect(getLastDayOfMonth(date)).toBe('2026-02-28')
    })
  })
})
