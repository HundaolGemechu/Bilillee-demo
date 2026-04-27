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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const formData = await req.formData()
    const file = formData.get('image') as File
    const appointmentId = formData.get('appointment_id') as string

    if (!file || !appointmentId) {
      throw new Error('Image and appointment_id are required')
    }

    // 1. Upload image to S3 (Supabase Storage)
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('payment-screenshots')
      .upload(`${appointmentId}/${Date.now()}_${file.name}`, file)

    if (uploadError) throw uploadError

    // 2. Update transaction/appointment status
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ 
        status: 'pending_verification',
        method: 'mobile_banking'
      })
      .eq('appointment_id', appointmentId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        path: uploadData.path,
        message: 'Screenshot uploaded and status updated to pending_verification' 
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
