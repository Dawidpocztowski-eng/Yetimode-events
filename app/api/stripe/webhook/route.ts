import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanKey } from '@/lib/stripe'
import { createClient as createServerClient } from '@supabase/supabase-js'

// Supabase admin client (service role) — omija RLS
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { user_id, plan, months } = session.metadata

    if (!user_id || !plan) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + parseInt(months || '12'))

    const { error } = await supabase.from('subscriptions').insert({
      user_id,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      plan,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    console.log(`✅ Plan ${plan} aktywowany dla użytkownika ${user_id}`)
  }

  return NextResponse.json({ received: true })
}
