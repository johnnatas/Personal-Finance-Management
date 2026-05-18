import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OFXTransaction {
  date: string
  amount: number
  description: string
  memo?: string
}

function parseCSV(content: string, accountId: string, userId: string): OFXTransaction[] {
  const lines = content.trim().split('\n')
  const transactions: OFXTransaction[] = []

  for (const line of lines.slice(1)) {
    const [date, desc, amountStr] = line.split(',').map(s => s.trim().replace(/"/g, ''))
    if (!date || !amountStr) continue
    const amount = parseFloat(amountStr)
    if (isNaN(amount)) continue
    transactions.push({ date, description: desc ?? '', amount })
  }

  return transactions
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { account_id, file_content, format = 'csv' } = await req.json()
    if (!account_id || !file_content) throw new Error('account_id and file_content are required')

    const rawTransactions = parseCSV(file_content, account_id, user.id)

    const imported = []
    const duplicates = []

    for (const txn of rawTransactions) {
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('account_id', account_id)
        .eq('date', txn.date)
        .eq('amount', Math.abs(txn.amount))
        .limit(1)

      if (existing && existing.length > 0) {
        duplicates.push(txn)
        continue
      }

      const type = txn.amount > 0 ? 'income' : 'expense'
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id,
          type,
          amount: Math.abs(txn.amount),
          description: txn.description || txn.memo || 'Importado',
          date: txn.date,
          status: 'completed',
          is_recurrent: false,
          tags: ['importado'],
        })
        .select()
        .single()

      if (error) { console.error('Import error:', error); continue }
      imported.push(data)
    }

    return new Response(
      JSON.stringify({ success: true, imported: imported.length, duplicates: duplicates.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
