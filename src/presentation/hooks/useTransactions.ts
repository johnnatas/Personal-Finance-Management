'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/infrastructure/supabase/client'

export interface TransactionRecord {
  id: string
  user_id: string
  account_id: string
  category_id?: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string
  date: string
  payment_method?: string
  status: 'pending' | 'completed' | 'cancelled'
  is_recurrent: boolean
  tags?: string[]
  notes?: string
  created_at: string
  account_name?: string
  account_color?: string
  category_name?: string
  category_color?: string
  category_icon?: string
}

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  type?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('transactions_detailed')
      .select('*')
      .order('date', { ascending: false })

    if (filters?.accountId) query = query.eq('account_id', filters.accountId)
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId)
    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
    if (filters?.dateTo) query = query.lte('date', filters.dateTo)

    const { data, error: err } = await query
    if (err) setError(err.message)
    else setTransactions(data ?? [])
    setLoading(false)
  }, [filters?.accountId, filters?.categoryId, filters?.type, filters?.status, filters?.dateFrom, filters?.dateTo])

  useEffect(() => {
    fetch()
  }, [fetch])

  const createTransaction = async (input: Omit<TransactionRecord, 'id' | 'user_id' | 'created_at' | 'account_name' | 'account_color' | 'category_name' | 'category_color' | 'category_icon'>) => {
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('transactions')
      .insert(input)
      .select()
      .single()
    if (err) throw new Error(err.message)
    await fetch()
    return data
  }

  const deleteTransaction = async (id: string) => {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString(), status: 'cancelled' })
      .eq('id', id)
    if (err) throw new Error(err.message)
    await fetch()
  }

  return { transactions, loading, error, refetch: fetch, createTransaction, deleteTransaction }
}
