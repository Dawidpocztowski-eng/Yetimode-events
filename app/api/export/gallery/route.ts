import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/planLimits'

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ error: 'Brak eventId' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 })

  const { data: event } = await supabase
    .from('events')
    .select('id, title')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single()

  if (!event) return NextResponse.json({ error: 'Brak dostępu' }, { status: 403 })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const plan = sub?.plan || 'free'
  const limits = getPlanLimits(plan)

  if (!limits.zipExport) {
    return NextResponse.json({ error: 'Eksport ZIP dostępny w planie Premium' }, { status: 403 })
  }

  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('url, storage_path, created_at')
    .eq('event_id', eventId)
    .order('created_at')

  // Zwróć listę URL-i do pobrania (frontend pobierze każde zdjęcie)
  return NextResponse.json({
    photos: photos?.map((p, i) => ({
      url: p.url,
      filename: `zdjecie-${i + 1}.jpg`,
    })) || [],
    eventTitle: event.title,
  })
}
