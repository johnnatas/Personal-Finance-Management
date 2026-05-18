import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateTransactionUseCase, CreateTransactionInput } from '../CreateTransactionUseCase'
import { TransactionType, TransactionStatus } from '@/domain/entities/Transaction'
import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import { IAccountRepository } from '@/domain/repositories/IAccountRepository'
import { Account, AccountType } from '@/domain/entities/Account'

const makeAccount = (overrides = {}): Account =>
  Account.create({
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
    ...overrides,
  })

const makeTransactionRepo = (): ITransactionRepository => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
  findDeleted: vi.fn(),
})

const makeAccountRepo = (): IAccountRepository => ({
  create: vi.fn(),
  findById: vi.fn().mockResolvedValue(makeAccount()),
  findByUserId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateBalance: vi.fn().mockResolvedValue(undefined),
})

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase
  let transactionRepo: ITransactionRepository
  let accountRepo: IAccountRepository

  const validInput: CreateTransactionInput = {
    userId: 'user-1',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    type: TransactionType.EXPENSE,
    amount: 150,
    description: 'Supermercado Extra',
    date: new Date('2026-05-01'),
    status: TransactionStatus.COMPLETED,
  }

  beforeEach(() => {
    transactionRepo = makeTransactionRepo()
    accountRepo = makeAccountRepo()
    useCase = new CreateTransactionUseCase(transactionRepo, accountRepo)

    vi.mocked(transactionRepo.create).mockImplementation(async (t) => t as Awaited<ReturnType<ITransactionRepository['create']>>)
  })

  it('should create an expense transaction and debit the account', async () => {
    const result = await useCase.execute(validInput)

    expect(result.type).toBe(TransactionType.EXPENSE)
    expect(result.amount).toBe(150)
    expect(transactionRepo.create).toHaveBeenCalledOnce()
    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-1', 850)
  })

  it('should create an income transaction and credit the account', async () => {
    const input = { ...validInput, type: TransactionType.INCOME, description: 'Salário' }
    await useCase.execute(input)

    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-1', 1150)
  })

  it('should throw when account does not exist', async () => {
    vi.mocked(accountRepo.findById).mockResolvedValue(null)

    await expect(useCase.execute(validInput))
      .rejects.toThrow('Account not found')
  })

  it('should throw when account does not belong to user', async () => {
    vi.mocked(accountRepo.findById).mockResolvedValue(makeAccount({ userId: 'other-user' }))

    await expect(useCase.execute(validInput))
      .rejects.toThrow('Account does not belong to user')
  })

  it('should create a transfer and update both accounts', async () => {
    const destAccount = makeAccount({ id: 'acc-2' })
    vi.mocked(accountRepo.findById)
      .mockResolvedValueOnce(makeAccount())
      .mockResolvedValueOnce(destAccount)

    const input = {
      ...validInput,
      type: TransactionType.TRANSFER,
      destinationAccountId: 'acc-2',
    }

    await useCase.execute(input)

    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-1', 850)
    expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc-2', 1150)
  })

  it('should not update balance for pending transactions', async () => {
    const input = { ...validInput, status: TransactionStatus.PENDING }
    await useCase.execute(input)

    expect(accountRepo.updateBalance).not.toHaveBeenCalled()
  })

  it('should throw when amount is zero', async () => {
    await expect(useCase.execute({ ...validInput, amount: 0 }))
      .rejects.toThrow('Transaction amount must be greater than zero')
  })
})
