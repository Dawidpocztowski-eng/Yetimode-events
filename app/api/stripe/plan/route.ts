import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ plan: 'free' })

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, expires_at, created_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    plan: data?.plan || 'free',
    expires_at: data?.expires_at || null,
  })
}
