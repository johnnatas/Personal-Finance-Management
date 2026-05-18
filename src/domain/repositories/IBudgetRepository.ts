import { Budget } from '../entities/Budget'

export interface IBudgetRepository {
  create(budget: Budget): Promise<Budget>
  findById(id: string): Promise<Budget | null>
  findByUserId(userId: string): Promise<Budget[]>
  findActiveByCategoryAndDate(categoryId: string, date: Date): Promise<Budget | null>
  update(id: string, data: Partial<Budget>): Promise<Budget>
  delete(id: string): Promise<void>
}
