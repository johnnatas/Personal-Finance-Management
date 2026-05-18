import { Transaction } from '../entities/Transaction'

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  type?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface ITransactionRepository {
  create(transaction: Omit<Transaction, never>): Promise<Transaction>
  findById(id: string): Promise<Transaction | null>
  findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]>
  update(id: string, data: Partial<Transaction>): Promise<Transaction>
  softDelete(id: string): Promise<void>
  restore(id: string): Promise<Transaction>
  findDeleted(userId: string): Promise<Transaction[]>
}
