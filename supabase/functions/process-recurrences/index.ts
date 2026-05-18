import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const today = new Date().toISOString().split('T')[0]

    const { data: recurrences, error: fetchError } = await supabaseAdmin
      .from('recurrences')
      .select('*')
      .eq('is_active', true)
      .lte('next_occurrence', today)

    if (fetchError) throw fetchError

    const results = []

    for (const recurrence of recurrences ?? []) {
      const template = recurrence.template_data

      const { data: transaction, error: insertError } = await supabaseAdmin
        .from('transactions')
        .insert({
          ...template,
          recurrence_id: recurrence.id,
          is_recurrent: true,
          date: recurrence.next_occurrence,
          status: 'completed',
        })
        .select()
        .single()

      if (insertError) {
        console.error(`Error creating transaction for recurrence ${recurrence.id}:`, insertError)
        continue
      }

      const nextDate = new Date(recurrence.next_occurrence)
      switch (recurrence.frequency) {
        case 'daily':   nextDate.setDate(nextDate.getDate() + recurrence.interval); break
        case 'weekly':  nextDate.setDate(nextDate.getDate() + 7 * recurrence.interval); break
        case 'monthly': nextDate.setMonth(nextDate.getMonth() + recurrence.interval); break
        case 'yearly':  nextDate.setFullYear(nextDate.getFullYear() + recurrence.interval); break
      }

      const nextOccurrence = nextDate.toISOString().split('T')[0]
      const shouldDeactivate = recurrence.end_date && nextOccurrence > recurrence.end_date

      await supabaseAdmin
        .from('recurrences')
        .update({
          next_occurrence: nextOccurrence,
          is_active: !shouldDeactivate,
        })
        .eq('id', recurrence.id)

      results.push({ recurrence_id: recurrence.id, transaction_id: transaction.id })
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
