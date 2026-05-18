import { describe, it, expect } from 'vitest'
import { Money } from '../Money'

describe('Money', () => {
  it('should create a valid money amount', () => {
    const money = Money.create(100.50, 'BRL')
    expect(money.amount).toBe(100.50)
    expect(money.currency).toBe('BRL')
  })

  it('should throw when amount is negative', () => {
    expect(() => Money.create(-1, 'BRL')).toThrow('Money amount cannot be negative')
  })

  it('should throw when amount exceeds maximum', () => {
    expect(() => Money.create(1_000_001, 'BRL')).toThrow('Money amount exceeds maximum allowed')
  })

  it('should round to 2 decimal places', () => {
    const money = Money.create(10.999, 'BRL')
    expect(money.amount).toBe(11.00)
  })

  it('should add two Money values of same currency', () => {
    const a = Money.create(100, 'BRL')
    const b = Money.create(50, 'BRL')
    expect(a.add(b).amount).toBe(150)
  })

  it('should subtract two Money values of same currency', () => {
    const a = Money.create(100, 'BRL')
    const b = Money.create(30, 'BRL')
    expect(a.subtract(b).amount).toBe(70)
  })

  it('should throw when subtracting different currencies', () => {
    const brl = Money.create(100, 'BRL')
    const usd = Money.create(50, 'USD')
    expect(() => brl.subtract(usd)).toThrow('Cannot operate on different currencies')
  })

  it('should check equality', () => {
    const a = Money.create(100, 'BRL')
    const b = Money.create(100, 'BRL')
    expect(a.equals(b)).toBe(true)
  })

  it('should format as string', () => {
    const money = Money.create(1234.56, 'BRL')
    expect(money.toString()).toBe('BRL 1234.56')
  })

  it('should allow zero amount', () => {
    const money = Money.create(0, 'BRL')
    expect(money.amount).toBe(0)
  })
})
