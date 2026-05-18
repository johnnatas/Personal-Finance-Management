'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/infrastructure/supabase/client'

export interface AccountRecord {
  id: string
  user_id: string
  name: string
  type: string
  initial_balance: number
  current_balance: number
  currency: string
  institution?: string
  color: string
  icon?: string
  is_active: boolean
  created_at: string
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (err) setError(err.message)
    else setAccounts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const totalBalance = accounts.reduce((sum, a) => sum + a.current_balance, 0)

  const createAccount = async (input: Omit<AccountRecord, 'id' | 'user_id' | 'created_at'>) => {
    const supabase = createClient()
    const { data, error: err } = await supabase.from('accounts').insert(input).select().single()
    if (err) throw new Error(err.message)
    await fetch()
    return data
  }

  return { accounts, loading, error, totalBalance, refetch: fetch, createAccount }
}
