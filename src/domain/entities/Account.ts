export enum AccountType {
  CHECKING_ACCOUNT = 'checking_account',
  SAVINGS_ACCOUNT = 'savings_account',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  CASH = 'cash',
  OTHER = 'other',
}

export interface AccountProps {
  id: string
  userId: string
  name: string
  type: AccountType
  initialBalance: number
  currentBalance: number
  currency: string
  institution?: string
  accountNumber?: string
  color: string
  icon?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class Account {
  private constructor(private readonly props: AccountProps) {}

  static create(props: AccountProps): Account {
    if (!props.name || props.name.trim() === '') throw new Error('Account name cannot be empty')
    if (props.name.length > 100) throw new Error('Account name cannot exceed 100 characters')
    if (props.initialBalance < 0) throw new Error('Initial balance cannot be negative')
    return new Account(props)
  }

  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get name() { return this.props.name }
  get type() { return this.props.type }
  get initialBalance() { return this.props.initialBalance }
  get currentBalance() { return this.props.currentBalance }
  get currency() { return this.props.currency }
  get institution() { return this.props.institution }
  get accountNumber() { return this.props.accountNumber }
  get color() { return this.props.color }
  get icon() { return this.props.icon }
  get isActive() { return this.props.isActive }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  credit(amount: number): Account {
    return new Account({ ...this.props, currentBalance: this.props.currentBalance + amount, updatedAt: new Date() })
  }

  debit(amount: number): Account {
    return new Account({ ...this.props, currentBalance: this.props.currentBalance - amount, updatedAt: new Date() })
  }

  deactivate(): Account {
    return new Account({ ...this.props, isActive: false, updatedAt: new Date() })
  }
}
