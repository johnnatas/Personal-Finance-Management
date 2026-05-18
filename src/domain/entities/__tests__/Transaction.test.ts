import { describe, it, expect } from 'vitest'
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../Transaction'

describe('Transaction', () => {
  const validProps = {
    id: 'txn-1',
    userId: 'user-1',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    type: TransactionType.EXPENSE,
    amount: 150.00,
    description: 'Supermercado',
    date: new Date('2026-05-01'),
    status: TransactionStatus.COMPLETED,
    isRecurrent: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should create a valid expense transaction', () => {
    const txn = Transaction.create(validProps)
    expect(txn.id).toBe('txn-1')
    expect(txn.type).toBe(TransactionType.EXPENSE)
    expect(txn.amount).toBe(150.00)
    expect(txn.description).toBe('Supermercado')
  })

  it('should create a valid income transaction', () => {
    const txn = Transaction.create({ ...validProps, type: TransactionType.INCOME, description: 'Salário' })
    expect(txn.type).toBe(TransactionType.INCOME)
  })

  it('should throw when amount is zero', () => {
    expect(() => Transaction.create({ ...validProps, amount: 0 }))
      .toThrow('Transaction amount must be greater than zero')
  })

  it('should throw when amount is negative', () => {
    expect(() => Transaction.create({ ...validProps, amount: -50 }))
      .toThrow('Transaction amount must be greater than zero')
  })

  it('should throw when description is empty', () => {
    expect(() => Transaction.create({ ...validProps, description: '' }))
      .toThrow('Transaction description cannot be empty')
  })

  it('should throw when description is too long', () => {
    expect(() => Transaction.create({ ...validProps, description: 'a'.repeat(256) }))
      .toThrow('Transaction description cannot exceed 255 characters')
  })

  it('should require destination account for transfer', () => {
    expect(() => Transaction.create({ ...validProps, type: TransactionType.TRANSFER }))
      .toThrow('Transfer transactions require a destination account')
  })

  it('should allow transfer with destination account', () => {
    const txn = Transaction.create({
      ...validProps,
      type: TransactionType.TRANSFER,
      destinationAccountId: 'acc-2',
    })
    expect(txn.type).toBe(TransactionType.TRANSFER)
    expect(txn.destinationAccountId).toBe('acc-2')
  })

  it('should throw when transfer has same origin and destination', () => {
    expect(() => Transaction.create({
      ...validProps,
      type: TransactionType.TRANSFER,
      destinationAccountId: 'acc-1',
    })).toThrow('Origin and destination accounts must be different')
  })

  it('should soft delete a transaction', () => {
    const txn = Transaction.create(validProps)
    const deleted = txn.softDelete()
    expect(deleted.deletedAt).toBeDefined()
    expect(deleted.status).toBe(TransactionStatus.CANCELLED)
  })

  it('should mark a transaction as completed', () => {
    const txn = Transaction.create({ ...validProps, status: TransactionStatus.PENDING })
    const completed = txn.complete()
    expect(completed.status).toBe(TransactionStatus.COMPLETED)
  })

  it('should validate installment data when provided', () => {
    expect(() => Transaction.create({
      ...validProps,
      installments: 3,
      currentInstallment: 5,
    })).toThrow('Current installment cannot exceed total installments')
  })

  it('should create with valid installment data', () => {
    const txn = Transaction.create({ ...validProps, installments: 3, currentInstallment: 1 })
    expect(txn.installments).toBe(3)
    expect(txn.currentInstallment).toBe(1)
  })

  it('should check if transaction is deleted', () => {
    const txn = Transaction.create(validProps)
    expect(txn.isDeleted()).toBe(false)
    const deleted = txn.softDelete()
    expect(deleted.isDeleted()).toBe(true)
  })

  it('should support all payment methods', () => {
    const methods = [PaymentMethod.CASH, PaymentMethod.PIX, PaymentMethod.CREDIT_CARD]
    methods.forEach(method => {
      const txn = Transaction.create({ ...validProps, paymentMethod: method })
      expect(txn.paymentMethod).toBe(method)
    })
  })
})
