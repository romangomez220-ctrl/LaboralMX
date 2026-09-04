import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { corsHeaders, json, sha256 } from '../_shared/report.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const TOKEN_OR_CHECKSUM = /^[0-9a-f]{64}$/

async function blobChecksum(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body: { purchaseId?: string; recoveryToken?: string; storagePath?: string; checksum?: string; outcome?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  const { purchaseId = '', recoveryToken = '', storagePath = '', checksum = '', outcome = 'generated' } = body
  if (!UUID.test(purchaseId) || !TOKEN_OR_CHECKSUM.test(recoveryToken)) return json({ error: 'Not found' }, 404)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return json({ error: 'Backend not configured' }, 503)
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const { data: purchase, error: purchaseError } = await admin.from('report_purchases')
    .select('id,report_folio,payment_status,report_status,access_token_hash').eq('id', purchaseId).maybeSingle()
  if (purchaseError) return json({ error: 'Unable to finalize report' }, 500)
  if (!purchase || purchase.access_token_hash !== await sha256(recoveryToken)) return json({ error: 'Not found' }, 404)
  if (purchase.payment_status !== 'paid') return json({ error: 'Not authorized' }, 403)

  if (outcome === 'failed') {
    await admin.from('report_purchases').update({ report_status: 'failed' })
      .eq('id', purchase.id).eq('report_status', 'generating')
    return json({ status: 'failed', paymentConfirmed: true, folio: purchase.report_folio })
  }
  if (outcome !== 'generated' || !TOKEN_OR_CHECKSUM.test(checksum)) return json({ error: 'Invalid finalization' }, 400)
  if (storagePath !== `${purchase.id}/${purchase.report_folio}.pdf`) return json({ error: 'Not authorized' }, 403)
  if (!['generating', 'generated'].includes(purchase.report_status)) return json({ error: 'Invalid report state' }, 409)

  const { data: storedPdf, error: downloadError } = await admin.storage.from('paid-reports').download(storagePath)
  if (downloadError || !storedPdf || storedPdf.size === 0 || storedPdf.size > 5_242_880) {
    await admin.from('report_purchases').update({ report_status: 'failed' })
      .eq('id', purchase.id).eq('report_status', 'generating')
    return json({ error: 'File not found or invalid' }, 409)
  }
  const signature = new TextDecoder().decode((await storedPdf.slice(0, 5).arrayBuffer()))
  const actualChecksum = await blobChecksum(storedPdf)
  if (signature !== '%PDF-' || actualChecksum !== checksum) {
    await admin.from('report_purchases').update({ report_status: 'failed' })
      .eq('id', purchase.id).eq('report_status', 'generating')
    return json({ error: 'File validation failed' }, 409)
  }

  const { error: fileError } = await admin.from('report_files')
    .upsert({ purchase_id: purchase.id, storage_path: storagePath, checksum: actualChecksum }, { onConflict: 'purchase_id' })
  if (fileError) {
    await admin.from('report_purchases').update({ report_status: 'failed' })
      .eq('id', purchase.id).eq('report_status', 'generating')
    return json({ error: 'Unable to register report' }, 500)
  }
  const { error: statusError } = await admin.from('report_purchases').update({
    report_status: 'generated', generated_at: new Date().toISOString(),
  }).eq('id', purchase.id).in('report_status', ['generating', 'generated'])
  if (statusError) return json({ error: 'Unable to finalize report' }, 500)

  const { data: signed, error: signError } = await admin.storage.from('paid-reports').createSignedUrl(storagePath, 300)
  if (signError || !signed?.signedUrl) return json({ error: 'Unable to sign download' }, 500)
  return json({ status: 'generated', paymentConfirmed: true, downloadUrl: signed.signedUrl, folio: purchase.report_folio })
})
