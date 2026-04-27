import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { appointment_id } = await req.json()

    // 1. Get appointment details
    const { data: appointment, error: aptError } = await supabaseAdmin
      .from('appointments')
      .select('*, businesses(id), client_id')
      .eq('id', appointment_id)
      .single()

    if (aptError) throw aptError

    // 2. Check if this is the client's first booking at this business
    const { count, error: countError } = await supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', appointment.business_id)
      .eq('client_id', appointment.client_id)
      .eq('status', 'confirmed') // Only count confirmed past bookings

    if (countError) throw countError

    const isFirstBooking = count === 0
    const commissionRate = isFirstBooking ? 0.20 : 0.0

    // 3. Get transaction amount
    const { data: transaction, error: txnError } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('appointment_id', appointment_id)
      .single()

    if (txnError) throw txnError

    const commissionAmount = transaction.amount * commissionRate

    // 4. Record commission
    const { error: commError } = await supabaseAdmin
      .from('commissions')
      .insert({
        business_id: appointment.business_id,
        client_id: appointment.client_id,
        appointment_id: appointment_id,
        amount: commissionAmount,
        is_first_booking: isFirstBooking
      })

    if (commError) throw commError

    // 5. Update transaction with commission amount
    await supabaseAdmin
      .from('transactions')
      .update({ commission_amount: commissionAmount })
      .eq('appointment_id', appointment_id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        is_first_booking: isFirstBooking, 
        commission_amount: commissionAmount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
