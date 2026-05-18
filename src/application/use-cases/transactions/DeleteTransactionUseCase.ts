import { TransactionType, TransactionStatus } from '@/domain/entities/Transaction'
import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import { IAccountRepository } from '@/domain/repositories/IAccountRepository'

export class DeleteTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(transactionId: string, userId: string): Promise<void> {
    const transaction = await this.transactionRepository.findById(transactionId)
    if (!transaction) throw new Error('Transaction not found')
    if (transaction.userId !== userId) throw new Error('Unauthorized')
    if (transaction.isDeleted()) throw new Error('Transaction is already deleted')

    await this.transactionRepository.softDelete(transactionId)

    if (transaction.status === TransactionStatus.COMPLETED) {
      const account = await this.accountRepository.findById(transaction.accountId)
      if (account) {
        if (transaction.type === TransactionType.INCOME) {
          await this.accountRepository.updateBalance(account.id, account.currentBalance - transaction.amount)
        } else if (transaction.type === TransactionType.EXPENSE) {
          await this.accountRepository.updateBalance(account.id, account.currentBalance + transaction.amount)
        } else if (transaction.type === TransactionType.TRANSFER && transaction.destinationAccountId) {
          const destAccount = await this.accountRepository.findById(transaction.destinationAccountId)
          if (destAccount) {
            await this.accountRepository.updateBalance(account.id, account.currentBalance + transaction.amount)
            await this.accountRepository.updateBalance(destAccount.id, destAccount.currentBalance - transaction.amount)
          }
        }
      }
    }
  }
}
