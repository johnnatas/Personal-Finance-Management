import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateBudgetUseCase, CreateBudgetInput } from '../CreateBudgetUseCase'
import { Budget, BudgetPeriod } from '@/domain/entities/Budget'
import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'

const makeBudgetRepo = (): IBudgetRepository => ({
  create: vi.fn().mockImplementation(async (b: Budget) => b),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findActiveByCategoryAndDate: vi.fn().mockResolvedValue(null),
  update: vi.fn(),
  delete: vi.fn(),
})

describe('CreateBudgetUseCase', () => {
  let useCase: CreateBudgetUseCase
  let budgetRepo: IBudgetRepository

  const validInput: CreateBudgetInput = {
    userId: 'user-1',
    categoryId: 'cat-1',
    amount: 1000,
    period: BudgetPeriod.MONTHLY,
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-05-31'),
    alertThreshold: 80,
  }

  beforeEach(() => {
    budgetRepo = makeBudgetRepo()
    useCase = new CreateBudgetUseCase(budgetRepo)
  })

  it('should create a budget successfully', async () => {
    const result = await useCase.execute(validInput)

    expect(result.amount).toBe(1000)
    expect(result.period).toBe(BudgetPeriod.MONTHLY)
    expect(budgetRepo.create).toHaveBeenCalledOnce()
  })

  it('should throw when budget already exists for category and period', async () => {
    vi.mocked(budgetRepo.findActiveByCategoryAndDate).mockResolvedValue(
      Budget.create({ id: 'b-1', userId: 'user-1', categoryId: 'cat-1', amount: 500,
        spent: 0, period: BudgetPeriod.MONTHLY, startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-31'), alertThreshold: 80, isActive: true,
        createdAt: new Date(), updatedAt: new Date() })
    )
    await expect(useCase.execute(validInput))
      .rejects.toThrow('Budget already exists for this category and period')
  })

  it('should use default alert threshold of 80 when not provided', async () => {
    const input = { ...validInput, alertThreshold: undefined }
    const result = await useCase.execute(input)
    expect(result.alertThreshold).toBe(80)
  })

  it('should throw when amount is zero', async () => {
    await expect(useCase.execute({ ...validInput, amount: 0 }))
      .rejects.toThrow('Budget amount must be greater than zero')
  })
})
