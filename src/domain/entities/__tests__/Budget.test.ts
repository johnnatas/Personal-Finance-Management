import { describe, it, expect } from 'vitest'
import { Budget, BudgetPeriod } from '../Budget'

describe('Budget', () => {
  const validProps = {
    id: 'budget-1',
    userId: 'user-1',
    categoryId: 'cat-1',
    amount: 1000,
    spent: 0,
    period: BudgetPeriod.MONTHLY,
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-05-31'),
    alertThreshold: 80,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should create a valid budget', () => {
    const budget = Budget.create(validProps)
    expect(budget.amount).toBe(1000)
    expect(budget.spent).toBe(0)
    expect(budget.alertThreshold).toBe(80)
  })

  it('should throw when amount is zero', () => {
    expect(() => Budget.create({ ...validProps, amount: 0 }))
      .toThrow('Budget amount must be greater than zero')
  })

  it('should throw when end date is before start date', () => {
    expect(() => Budget.create({
      ...validProps,
      startDate: new Date('2026-05-31'),
      endDate: new Date('2026-05-01'),
    })).toThrow('End date must be after start date')
  })

  it('should throw when alert threshold exceeds 150', () => {
    expect(() => Budget.create({ ...validProps, alertThreshold: 151 }))
      .toThrow('Alert threshold must be between 0 and 150')
  })

  it('should calculate usage percentage', () => {
    const budget = Budget.create({ ...validProps, spent: 800 })
    expect(budget.usagePercentage()).toBe(80)
  })

  it('should detect when budget is exceeded', () => {
    const budget = Budget.create({ ...validProps, spent: 1100 })
    expect(budget.isExceeded()).toBe(true)
  })

  it('should detect when alert should be triggered', () => {
    const budget = Budget.create({ ...validProps, spent: 850 })
    expect(budget.shouldAlert()).toBe(true)
  })

  it('should not alert when under threshold', () => {
    const budget = Budget.create({ ...validProps, spent: 500 })
    expect(budget.shouldAlert()).toBe(false)
  })

  it('should calculate remaining amount', () => {
    const budget = Budget.create({ ...validProps, spent: 300 })
    expect(budget.remaining()).toBe(700)
  })

  it('should update spent amount', () => {
    const budget = Budget.create(validProps)
    const updated = budget.updateSpent(450)
    expect(updated.spent).toBe(450)
  })
})
