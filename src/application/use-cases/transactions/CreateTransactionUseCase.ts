import { v4 as uuidv4 } from 'uuid'
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '@/domain/entities/Transaction'
import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import { IAccountRepository } from '@/domain/repositories/IAccountRepository'

export interface CreateTransactionInput {
  userId: string
  accountId: string
  categoryId?: string
  type: TransactionType
  amount: number
  description: string
  date: Date
  paymentMethod?: PaymentMethod
  status?: TransactionStatus
  destinationAccountId?: string
  installments?: number
  currentInstallment?: number
  tags?: string[]
  notes?: string
  isRecurrent?: boolean
  recurrenceId?: string
}

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    const account = await this.accountRepository.findById(input.accountId)
    if (!account) throw new Error('Account not found')
    if (account.userId !== input.userId) throw new Error('Account does not belong to user')

    if (input.type === TransactionType.TRANSFER && input.destinationAccountId) {
      const destAccount = await this.accountRepository.findById(input.destinationAccountId)
      if (!destAccount) throw new Error('Destination account not found')
    }

    const status = input.status ?? TransactionStatus.COMPLETED

    const transaction = Transaction.create({
      id: uuidv4(),
      userId: input.userId,
      accountId: input.accountId,
      categoryId: input.categoryId,
      type: input.type,
      amount: input.amount,
      description: input.description,
      date: input.date,
      paymentMethod: input.paymentMethod,
      status,
      isRecurrent: input.isRecurrent ?? false,
      recurrenceId: input.recurrenceId,
      destinationAccountId: input.destinationAccountId,
      installments: input.installments,
      currentInstallment: input.currentInstallment,
      tags: input.tags ?? [],
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const saved = await this.transactionRepository.create(transaction)

    if (status === TransactionStatus.COMPLETED) {
      await this.updateBalances(saved, account.currentBalance)
    }

    return saved
  }

  private async updateBalances(transaction: Transaction, currentBalance: number): Promise<void> {
    if (transaction.type === TransactionType.INCOME) {
      await this.accountRepository.updateBalance(transaction.accountId, currentBalance + transaction.amount)
    } else if (transaction.type === TransactionType.EXPENSE) {
      await this.accountRepository.updateBalance(transaction.accountId, currentBalance - transaction.amount)
    } else if (transaction.type === TransactionType.TRANSFER && transaction.destinationAccountId) {
      const destAccount = await this.accountRepository.findById(transaction.destinationAccountId)
      if (destAccount) {
        await this.accountRepository.updateBalance(transaction.accountId, currentBalance - transaction.amount)
        await this.accountRepository.updateBalance(transaction.destinationAccountId, destAccount.currentBalance + transaction.amount)
      }
    }
  }
}
