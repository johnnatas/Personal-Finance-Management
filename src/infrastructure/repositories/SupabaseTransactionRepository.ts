import { SupabaseClient } from '@supabase/supabase-js'
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '@/domain/entities/Transaction'
import { ITransactionRepository, TransactionFilters } from '@/domain/repositories/ITransactionRepository'

type TransactionRow = {
  id: string
  user_id: string
  account_id: string
  category_id?: string
  type: string
  amount: number
  description: string
  date: string
  payment_method?: string
  status: string
  is_recurrent: boolean
  recurrence_id?: string
  destination_account_id?: string
  transfer_id?: string
  installments?: number
  current_installment?: number
  tags?: string[]
  notes?: string
  metadata?: Record<string, unknown>
  deleted_at?: string
  created_at: string
  updated_at: string
}

function rowToEntity(row: TransactionRow): Transaction {
  return Transaction.create({
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    categoryId: row.category_id,
    type: row.type as TransactionType,
    amount: row.amount,
    description: row.description,
    date: new Date(row.date),
    paymentMethod: row.payment_method as PaymentMethod | undefined,
    status: row.status as TransactionStatus,
    isRecurrent: row.is_recurrent,
    recurrenceId: row.recurrence_id,
    destinationAccountId: row.destination_account_id,
    transferId: row.transfer_id,
    installments: row.installments,
    currentInstallment: row.current_installment,
    tags: row.tags ?? [],
    notes: row.notes,
    metadata: row.metadata,
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  })
}

export class SupabaseTransactionRepository implements ITransactionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert({
        id: transaction.id,
        user_id: transaction.userId,
        account_id: transaction.accountId,
        category_id: transaction.categoryId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date.toISOString().split('T')[0],
        payment_method: transaction.paymentMethod,
        status: transaction.status,
        is_recurrent: transaction.isRecurrent,
        recurrence_id: transaction.recurrenceId,
        destination_account_id: transaction.destinationAccountId,
        installments: transaction.installments,
        current_installment: transaction.currentInstallment,
        tags: transaction.tags,
        notes: transaction.notes,
        metadata: transaction.metadata,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return rowToEntity(data as TransactionRow)
  }

  async findById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select()
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return null
    return rowToEntity(data as TransactionRow)
  }

  async findByUserId(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    let query = this.supabase
      .from('transactions')
      .select()
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('date', { ascending: false })

    if (filters?.accountId) query = query.eq('account_id', filters.accountId)
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId)
    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
    if (filters?.dateTo) query = query.lte('date', filters.dateTo)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data as TransactionRow[]).map(rowToEntity)
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const { data: updated, error } = await this.supabase
      .from('transactions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return rowToEntity(updated as TransactionRow)
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString(), status: 'cancelled' })
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async restore(id: string): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .update({ deleted_at: null, status: 'completed' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return rowToEntity(data as TransactionRow)
  }

  async findDeleted(userId: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select()
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as TransactionRow[]).map(rowToEntity)
  }
}
