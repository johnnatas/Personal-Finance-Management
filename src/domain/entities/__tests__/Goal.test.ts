import { describe, it, expect } from 'vitest'
import { Goal, GoalStatus, GoalType, GoalPriority } from '../Goal'

describe('Goal', () => {
  const validProps = {
    id: 'goal-1',
    userId: 'user-1',
    name: 'Fundo de Emergência',
    targetAmount: 10000,
    currentAmount: 2500,
    deadline: new Date('2026-12-31'),
    status: GoalStatus.IN_PROGRESS,
    type: GoalType.EMERGENCY_FUND,
    priority: GoalPriority.HIGH,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should create a valid goal', () => {
    const goal = Goal.create(validProps)
    expect(goal.name).toBe('Fundo de Emergência')
    expect(goal.targetAmount).toBe(10000)
    expect(goal.currentAmount).toBe(2500)
  })

  it('should throw when name is empty', () => {
    expect(() => Goal.create({ ...validProps, name: '' }))
      .toThrow('Goal name cannot be empty')
  })

  it('should throw when target amount is zero', () => {
    expect(() => Goal.create({ ...validProps, targetAmount: 0 }))
      .toThrow('Target amount must be greater than zero')
  })

  it('should throw when deadline is in the past', () => {
    expect(() => Goal.create({ ...validProps, deadline: new Date('2020-01-01') }))
      .toThrow('Goal deadline must be in the future')
  })

  it('should calculate progress percentage', () => {
    const goal = Goal.create(validProps)
    expect(goal.progressPercentage()).toBe(25)
  })

  it('should detect when goal is achieved', () => {
    const goal = Goal.create({ ...validProps, currentAmount: 10000 })
    expect(goal.isAchieved()).toBe(true)
  })

  it('should mark goal as achieved when progress reaches 100%', () => {
    const goal = Goal.create(validProps)
    const achieved = goal.contribute(7500)
    expect(achieved.status).toBe(GoalStatus.ACHIEVED)
    expect(achieved.currentAmount).toBe(10000)
  })

  it('should calculate monthly contribution needed', () => {
    const goal = Goal.create({
      ...validProps,
      currentAmount: 0,
      deadline: new Date('2026-11-18'),
    })
    const monthlyNeeded = goal.monthlyContributionNeeded()
    expect(monthlyNeeded).toBeGreaterThan(0)
  })

  it('should contribute amount to goal', () => {
    const goal = Goal.create(validProps)
    const updated = goal.contribute(500)
    expect(updated.currentAmount).toBe(3000)
  })

  it('should cancel a goal', () => {
    const goal = Goal.create(validProps)
    const cancelled = goal.cancel()
    expect(cancelled.status).toBe(GoalStatus.CANCELLED)
  })

  it('should check milestone reached', () => {
    const goal = Goal.create({ ...validProps, currentAmount: 2500 })
    expect(goal.isMilestoneReached(25)).toBe(true)
    expect(goal.isMilestoneReached(50)).toBe(false)
  })
})
