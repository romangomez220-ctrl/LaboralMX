import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { reportGenerationCanBeClaimed } from '../../../shared/reportPayments.ts'
import { corsHeaders, json, sha256 } from '../_shared/report.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const TOKEN = /^[0-9a-f]{64}$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let purchaseId: string
  let recoveryToken: string
  try {
    ({ purchaseId, recoveryToken } = await req.json())
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  if (!UUID.test(purchaseId) || !TOKEN.test(recoveryToken)) return json({ error: 'Not found' }, 404)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return json({ error: 'Backend not configured' }, 503)
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const { data: purchase, error: purchaseError } = await admin.from('report_purchases')
    .select('id,report_folio,payment_status,report_status,report_version,calculator_version,calculation_snapshot,access_token_hash,download_count,generation_started_at')
    .eq('id', purchaseId).maybeSingle()
  if (purchaseError) return json({ error: 'Unable to recover report' }, 500)
  if (!purchase || purchase.access_token_hash !== await sha256(recoveryToken)) return json({ error: 'Not found' }, 404)
  if (purchase.payment_status !== 'paid') return json({ status: purchase.payment_status }, 202)

  const { data: file, error: fileError } = await admin.from('report_files')
    .select('storage_path').eq('purchase_id', purchase.id).maybeSingle()
  if (fileError) return json({ error: 'Unable to recover report' }, 500)
  if (file) {
    const { data, error } = await admin.storage.from('paid-reports').createSignedUrl(file.storage_path, 300)
    if (error || !data?.signedUrl) return json({ error: 'Unable to sign download' }, 500)
    await admin.from('report_purchases').update({
      downloaded_at: new Date().toISOString(), download_count: (purchase.download_count ?? 0) + 1,
    }).eq('id', purchase.id)
    return json({ status: 'generated', paymentConfirmed: true, downloadUrl: data.signedUrl, folio: purchase.report_folio })
  }

  if (!reportGenerationCanBeClaimed(purchase.report_status, purchase.generation_started_at)) {
    return json({ status: 'pending', paymentConfirmed: true }, 202)
  }

  const generationStartedAt = new Date().toISOString()
  let claim = admin.from('report_purchases').update({
    report_status: 'generating', generation_started_at: generationStartedAt,
  }).eq('id', purchase.id).eq('payment_status', 'paid').eq('report_status', purchase.report_status)
  if (purchase.report_status === 'generating' && purchase.generation_started_at) {
    claim = claim.eq('generation_started_at', purchase.generation_started_at)
  }
  const { data: claimed, error: claimError } = await claim.select('id').maybeSingle()
  if (claimError) return json({ error: 'Unable to authorize report generation' }, 500)
  if (!claimed) return json({ status: 'pending', paymentConfirmed: true }, 202)

  const path = `${purchase.id}/${purchase.report_folio}.pdf`
  const { data: upload, error } = await admin.storage.from('paid-reports').createSignedUploadUrl(path, { upsert: true })
  if (error || !upload?.token) {
    await admin.from('report_purchases').update({ report_status: 'failed' })
      .eq('id', purchase.id).eq('report_status', 'generating').eq('generation_started_at', generationStartedAt)
    return json({ error: 'Unable to authorize report generation' }, 500)
  }
  return json({
    status: 'authorized', paymentConfirmed: true, folio: purchase.report_folio,
    reportVersion: purchase.report_version, calculatorVersion: purchase.calculator_version,
    snapshot: purchase.calculation_snapshot, uploadPath: path, uploadToken: upload.token,
  })
})
