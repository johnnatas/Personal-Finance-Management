import { describe, it, expect } from 'vitest'
import { Account, AccountType } from '../Account'

describe('Account', () => {
  const validProps = {
    id: 'acc-1',
    userId: 'user-1',
    name: 'Conta Corrente',
    type: AccountType.CHECKING_ACCOUNT,
    initialBalance: 1000,
    currentBalance: 1000,
    currency: 'BRL',
    color: '#3B82F6',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should create a valid account', () => {
    const account = Account.create(validProps)
    expect(account.name).toBe('Conta Corrente')
    expect(account.type).toBe(AccountType.CHECKING_ACCOUNT)
    expect(account.currentBalance).toBe(1000)
  })

  it('should throw when name is empty', () => {
    expect(() => Account.create({ ...validProps, name: '' }))
      .toThrow('Account name cannot be empty')
  })

  it('should throw when initial balance is negative', () => {
    expect(() => Account.create({ ...validProps, initialBalance: -100 }))
      .toThrow('Initial balance cannot be negative')
  })

  it('should credit amount to balance', () => {
    const account = Account.create(validProps)
    const updated = account.credit(500)
    expect(updated.currentBalance).toBe(1500)
  })

  it('should debit amount from balance', () => {
    const account = Account.create(validProps)
    const updated = account.debit(200)
    expect(updated.currentBalance).toBe(800)
  })

  it('should allow negative balance after debit', () => {
    const account = Account.create(validProps)
    const updated = account.debit(1500)
    expect(updated.currentBalance).toBe(-500)
  })

  it('should deactivate an account', () => {
    const account = Account.create(validProps)
    const deactivated = account.deactivate()
    expect(deactivated.isActive).toBe(false)
  })

  it('should support all account types', () => {
    const types = [
      AccountType.CHECKING_ACCOUNT,
      AccountType.SAVINGS_ACCOUNT,
      AccountType.CREDIT_CARD,
      AccountType.INVESTMENT,
      AccountType.CASH,
      AccountType.OTHER,
    ]
    types.forEach(type => {
      const account = Account.create({ ...validProps, type })
      expect(account.type).toBe(type)
    })
  })

  it('should throw when name exceeds 100 characters', () => {
    expect(() => Account.create({ ...validProps, name: 'a'.repeat(101) }))
      .toThrow('Account name cannot exceed 100 characters')
  })
})
