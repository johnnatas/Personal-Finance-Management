import { Goal } from '../entities/Goal'

export interface IGoalRepository {
  create(goal: Goal): Promise<Goal>
  findById(id: string): Promise<Goal | null>
  findByUserId(userId: string): Promise<Goal[]>
  update(id: string, data: Partial<Goal>): Promise<Goal>
  delete(id: string): Promise<void>
}
