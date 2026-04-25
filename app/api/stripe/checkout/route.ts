import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanKey } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: 'Nieprawidłowy plan' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 })
    }

    const planData = PLANS[plan as PlanKey]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: planData.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?payment=success&plan=${plan}`,
      cancel_url: `${appUrl}/pricing?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan,
        months: String(planData.months),
      },
      locale: 'pl',
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
