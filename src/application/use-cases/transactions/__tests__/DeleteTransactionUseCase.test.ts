import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteTransactionUseCase } from '../DeleteTransactionUseCase'
import { Transaction, TransactionType, TransactionStatus } from '@/domain/entities/Transaction'
import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import { IAccountRepository } from '@/domain/repositories/IAccountRepository'
import { Account, AccountType } from '@/domain/entities/Account'

const makeTransaction = (overrides = {}): Transaction =>
  Transaction.create({
    id: 'txn-1',
    userId: 'user-1',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    type: TransactionType.EXPENSE,
    amount: 100,
    description: 'Test transaction',
    date: new Date(),
    status: TransactionStatus.COMPLETED,
    isRecurrent: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

describe('DeleteTransactionUseCase', () => {
  let useCase: DeleteTransactionUseCase
  let transactionRepo: ITransactionRepository
  let accountRepo: IAccountRepository

  beforeEach(() => {
    transactionRepo = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(makeTransaction()),
      findByUserId: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn().mockResolvedValue(undefined),
      restore: vi.fn(),
      findDeleted: vi.fn(),
    }
    accountRepo = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(
        Account.create({
          id: 'acc-1', userId: 'user-1', name: 'Conta', type: AccountType.CHECKING_ACCOUNT,
          initialBalance: 0, currentBalance: 900, currency: 'BRL', color: '#000',
          isActive: true, createdAt: new Date(), updatedAt: new Date(),
        })
      ),
      findByUserId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateBalance: vi.fn().mockResolvedValue(undefined),
    }
    useCase = new DeleteTransactionUseCase(transactionRepo, accountRepo)
  })

  it('should soft delete a transaction and revert balance', async () => {
    await useCase.execute('txn-1', 'user-1')

    expect(transactionRepo.softDelete).toHaveBeenCalledWith('txn-1')
    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-1', 1000)
  })

  it('should throw when transaction not found', async () => {
    vi.mocked(transactionRepo.findById).mockResolvedValue(null)
    await expect(useCase.execute('txn-1', 'user-1')).rejects.toThrow('Transaction not found')
  })

  it('should throw when transaction belongs to another user', async () => {
    vi.mocked(transactionRepo.findById).mockResolvedValue(makeTransaction({ userId: 'other-user' }))
    await expect(useCase.execute('txn-1', 'user-1')).rejects.toThrow('Unauthorized')
  })

  it('should not revert balance for already deleted transactions', async () => {
    const deleted = makeTransaction().softDelete()
    vi.mocked(transactionRepo.findById).mockResolvedValue(deleted)

    await expect(useCase.execute('txn-1', 'user-1')).rejects.toThrow('Transaction is already deleted')
  })
})
