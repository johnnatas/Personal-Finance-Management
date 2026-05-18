export enum GoalStatus {
  IN_PROGRESS = 'in_progress',
  ACHIEVED = 'achieved',
  CANCELLED = 'cancelled',
}

export enum GoalType {
  SAVINGS = 'savings',
  DEBT_PAYMENT = 'debt_payment',
  PURCHASE = 'purchase',
  EMERGENCY_FUND = 'emergency_fund',
  OTHER = 'other',
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface GoalProps {
  id: string
  userId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline?: Date
  status: GoalStatus
  type: GoalType
  linkedAccountId?: string
  priority: GoalPriority
  createdAt: Date
  updatedAt: Date
}

export class Goal {
  private constructor(private readonly props: GoalProps) {}

  static create(props: GoalProps): Goal {
    if (!props.name || props.name.trim() === '') throw new Error('Goal name cannot be empty')
    if (props.targetAmount <= 0) throw new Error('Target amount must be greater than zero')
    if (props.deadline && props.deadline <= new Date()) throw new Error('Goal deadline must be in the future')
    return new Goal(props)
  }

  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get name() { return this.props.name }
  get description() { return this.props.description }
  get targetAmount() { return this.props.targetAmount }
  get currentAmount() { return this.props.currentAmount }
  get deadline() { return this.props.deadline }
  get status() { return this.props.status }
  get type() { return this.props.type }
  get linkedAccountId() { return this.props.linkedAccountId }
  get priority() { return this.props.priority }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  progressPercentage(): number {
    return Math.min(100, Math.round((this.props.currentAmount / this.props.targetAmount) * 100))
  }

  isAchieved(): boolean {
    return this.props.currentAmount >= this.props.targetAmount
  }

  isMilestoneReached(milestone: number): boolean {
    return this.progressPercentage() >= milestone
  }

  monthlyContributionNeeded(): number {
    if (!this.props.deadline) return 0
    const now = new Date()
    const months = (this.props.deadline.getFullYear() - now.getFullYear()) * 12
      + (this.props.deadline.getMonth() - now.getMonth())
    if (months <= 0) return this.props.targetAmount - this.props.currentAmount
    return (this.props.targetAmount - this.props.currentAmount) / months
  }

  contribute(amount: number): Goal {
    const newAmount = this.props.currentAmount + amount
    const achieved = newAmount >= this.props.targetAmount
    return new Goal({
      ...this.props,
      currentAmount: newAmount,
      status: achieved ? GoalStatus.ACHIEVED : this.props.status,
      updatedAt: new Date(),
    })
  }

  cancel(): Goal {
    return new Goal({ ...this.props, status: GoalStatus.CANCELLED, updatedAt: new Date() })
  }
}
