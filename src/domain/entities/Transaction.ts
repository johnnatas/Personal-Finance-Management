export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  DEBIT_CARD = 'debit_card',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  PIX = 'pix',
  BOLETO = 'boleto',
  OTHER = 'other',
}

export interface TransactionProps {
  id: string
  userId: string
  accountId: string
  categoryId?: string
  type: TransactionType
  amount: number
  description: string
  date: Date
  paymentMethod?: PaymentMethod
  status: TransactionStatus
  isRecurrent: boolean
  recurrenceId?: string
  destinationAccountId?: string
  transferId?: string
  installments?: number
  currentInstallment?: number
  tags: string[]
  notes?: string
  metadata?: Record<string, unknown>
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static create(props: TransactionProps): Transaction {
    if (props.amount <= 0) throw new Error('Transaction amount must be greater than zero')
    if (!props.description || props.description.trim() === '') throw new Error('Transaction description cannot be empty')
    if (props.description.length > 255) throw new Error('Transaction description cannot exceed 255 characters')

    if (props.type === TransactionType.TRANSFER) {
      if (!props.destinationAccountId) throw new Error('Transfer transactions require a destination account')
      if (props.destinationAccountId === props.accountId) throw new Error('Origin and destination accounts must be different')
    }

    if (props.installments !== undefined && props.currentInstallment !== undefined) {
      if (props.currentInstallment > props.installments) throw new Error('Current installment cannot exceed total installments')
    }

    return new Transaction(props)
  }

  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get accountId() { return this.props.accountId }
  get categoryId() { return this.props.categoryId }
  get type() { return this.props.type }
  get amount() { return this.props.amount }
  get description() { return this.props.description }
  get date() { return this.props.date }
  get paymentMethod() { return this.props.paymentMethod }
  get status() { return this.props.status }
  get isRecurrent() { return this.props.isRecurrent }
  get recurrenceId() { return this.props.recurrenceId }
  get destinationAccountId() { return this.props.destinationAccountId }
  get transferId() { return this.props.transferId }
  get installments() { return this.props.installments }
  get currentInstallment() { return this.props.currentInstallment }
  get tags() { return this.props.tags }
  get notes() { return this.props.notes }
  get metadata() { return this.props.metadata }
  get deletedAt() { return this.props.deletedAt }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  isDeleted(): boolean {
    return this.props.deletedAt !== undefined
  }

  softDelete(): Transaction {
    return new Transaction({
      ...this.props,
      status: TransactionStatus.CANCELLED,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  complete(): Transaction {
    return new Transaction({
      ...this.props,
      status: TransactionStatus.COMPLETED,
      updatedAt: new Date(),
    })
  }
}
