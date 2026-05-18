import { v4 as uuidv4 } from 'uuid'
import { Budget, BudgetPeriod } from '@/domain/entities/Budget'
import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository'

export interface CreateBudgetInput {
  userId: string
  categoryId: string
  amount: number
  period: BudgetPeriod
  startDate: Date
  endDate: Date
  alertThreshold?: number
}

export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: CreateBudgetInput): Promise<Budget> {
    const existing = await this.budgetRepository.findActiveByCategoryAndDate(
      input.categoryId,
      input.startDate,
    )
    if (existing) throw new Error('Budget already exists for this category and period')

    const budget = Budget.create({
      id: uuidv4(),
      userId: input.userId,
      categoryId: input.categoryId,
      amount: input.amount,
      spent: 0,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
      alertThreshold: input.alertThreshold ?? 80,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return this.budgetRepository.create(budget)
  }
}
