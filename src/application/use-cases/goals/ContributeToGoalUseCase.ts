import { Goal, GoalStatus } from '@/domain/entities/Goal'
import { IGoalRepository } from '@/domain/repositories/IGoalRepository'

export interface ContributeToGoalInput {
  goalId: string
  userId: string
  amount: number
}

export class ContributeToGoalUseCase {
  constructor(private readonly goalRepository: IGoalRepository) {}

  async execute(input: ContributeToGoalInput): Promise<Goal> {
    if (input.amount <= 0) throw new Error('Contribution amount must be greater than zero')

    const goal = await this.goalRepository.findById(input.goalId)
    if (!goal) throw new Error('Goal not found')
    if (goal.userId !== input.userId) throw new Error('Unauthorized')
    if (goal.status === GoalStatus.CANCELLED) throw new Error('Cannot contribute to a cancelled goal')

    const updated = goal.contribute(input.amount)

    return this.goalRepository.update(input.goalId, {
      currentAmount: updated.currentAmount,
      status: updated.status,
    } as Partial<Goal>)
  }
}
