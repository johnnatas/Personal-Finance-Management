import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContributeToGoalUseCase } from '../ContributeToGoalUseCase'
import { Goal, GoalStatus, GoalType, GoalPriority } from '@/domain/entities/Goal'
import { IGoalRepository } from '@/domain/repositories/IGoalRepository'

const makeGoal = (overrides = {}): Goal =>
  Goal.create({
    id: 'goal-1',
    userId: 'user-1',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentAmount: 2000,
    deadline: new Date('2027-01-01'),
    status: GoalStatus.IN_PROGRESS,
    type: GoalType.EMERGENCY_FUND,
    priority: GoalPriority.HIGH,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

describe('ContributeToGoalUseCase', () => {
  let useCase: ContributeToGoalUseCase
  let goalRepo: IGoalRepository

  beforeEach(() => {
    goalRepo = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(makeGoal()),
      findByUserId: vi.fn(),
      update: vi.fn().mockImplementation(async (_id, data) => ({ ...makeGoal(), ...data })),
      delete: vi.fn(),
    }
    useCase = new ContributeToGoalUseCase(goalRepo)
  })

  it('should add contribution to goal', async () => {
    await useCase.execute({ goalId: 'goal-1', userId: 'user-1', amount: 500 })
    expect(goalRepo.update).toHaveBeenCalledWith('goal-1', expect.objectContaining({ currentAmount: 2500 }))
  })

  it('should throw when goal not found', async () => {
    vi.mocked(goalRepo.findById).mockResolvedValue(null)
    await expect(useCase.execute({ goalId: 'goal-1', userId: 'user-1', amount: 500 }))
      .rejects.toThrow('Goal not found')
  })

  it('should throw when goal belongs to another user', async () => {
    vi.mocked(goalRepo.findById).mockResolvedValue(makeGoal({ userId: 'other-user' }))
    await expect(useCase.execute({ goalId: 'goal-1', userId: 'user-1', amount: 500 }))
      .rejects.toThrow('Unauthorized')
  })

  it('should throw when contribution amount is zero or negative', async () => {
    await expect(useCase.execute({ goalId: 'goal-1', userId: 'user-1', amount: 0 }))
      .rejects.toThrow('Contribution amount must be greater than zero')
  })

  it('should mark goal as achieved when target is reached', async () => {
    await useCase.execute({ goalId: 'goal-1', userId: 'user-1', amount: 8000 })
    expect(goalRepo.update).toHaveBeenCalledWith('goal-1', expect.objectContaining({
      status: GoalStatus.ACHIEVED,
    }))
  })

  it('should throw when contributing to a cancelled goal', async () => {
    vi.mocked(goalRepo.findById).mockResolvedValue(makeGoal({ status: GoalStatus.CANCELLED }))
    await expect(useCase.execute({ goalId: 'goal-1', userId: 'user-1', amount: 500 }))
      .rejects.toThrow('Cannot contribute to a cancelled goal')
  })
})
