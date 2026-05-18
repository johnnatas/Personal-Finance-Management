export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export interface BudgetProps {
  id: string
  userId: string
  categoryId: string
  amount: number
  spent: number
  period: BudgetPeriod
  startDate: Date
  endDate: Date
  alertThreshold: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class Budget {
  private constructor(private readonly props: BudgetProps) {}

  static create(props: BudgetProps): Budget {
    if (props.amount <= 0) throw new Error('Budget amount must be greater than zero')
    if (props.endDate <= props.startDate) throw new Error('End date must be after start date')
    if (props.alertThreshold < 0 || props.alertThreshold > 150) throw new Error('Alert threshold must be between 0 and 150')
    return new Budget(props)
  }

  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get categoryId() { return this.props.categoryId }
  get amount() { return this.props.amount }
  get spent() { return this.props.spent }
  get period() { return this.props.period }
  get startDate() { return this.props.startDate }
  get endDate() { return this.props.endDate }
  get alertThreshold() { return this.props.alertThreshold }
  get isActive() { return this.props.isActive }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  usagePercentage(): number {
    return Math.round((this.props.spent / this.props.amount) * 100)
  }

  remaining(): number {
    return Math.max(0, this.props.amount - this.props.spent)
  }

  isExceeded(): boolean {
    return this.props.spent > this.props.amount
  }

  shouldAlert(): boolean {
    return this.usagePercentage() >= this.props.alertThreshold
  }

  updateSpent(newSpent: number): Budget {
    return new Budget({ ...this.props, spent: newSpent, updatedAt: new Date() })
  }
}
