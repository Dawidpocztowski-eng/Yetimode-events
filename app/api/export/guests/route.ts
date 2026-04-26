import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/planLimits'

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ error: 'Brak eventId' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nie zalogowany' }, { status: 401 })

  // Sprawdź czy wydarzenie należy do użytkownika
  const { data: event } = await supabase
    .from('events')
    .select('id, title')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single()

  if (!event) return NextResponse.json({ error: 'Brak dostępu' }, { status: 403 })

  // Sprawdź plan
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

  if (!limits.csvExport) {
    return NextResponse.json({ error: 'Eksport CSV dostępny od planu Wydarzenie' }, { status: 403 })
  }

  // Pobierz gości
  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', eventId)
    .order('name')

  // Pobierz RSVP
  const { data: rsvps } = await supabase
    .from('rsvp_entries')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at')

  // Generuj CSV
  const rows: string[] = []
  rows.push('Imię i nazwisko,Grupa,Potwierdzone,Osoba towarzysząca,Dzieci,Uwagi')

  for (const g of guests || []) {
    const children = (g.children || []).map((c: any) => c.name).join('; ')
    rows.push([
      `"${g.name}"`,
      `"${g.group_type}"`,
      g.confirmed ? 'Tak' : 'Nie',
      `"${g.companion_name || ''}"`,
      `"${children}"`,
      `"${g.notes || ''}"`,
    ].join(','))
  }

  rows.push('')
  rows.push('--- RSVP ---')
  rows.push('Imię,Nazwisko,Obecność,Goście,Nocleg,Transport,Dieta,Uwagi,Data')

  for (const r of rsvps || []) {
    rows.push([
      `"${r.first_name}"`,
      `"${r.last_name}"`,
      r.attending ? 'Tak' : 'Nie',
      r.guests_count || 1,
      r.accommodation ? 'Tak' : 'Nie',
      r.transport ? 'Tak' : 'Nie',
      `"${r.dietary_needs || ''}"`,
      `"${r.notes || ''}"`,
      new Date(r.created_at).toLocaleDateString('pl-PL'),
    ].join(','))
  }

  const csv = rows.join('\n')
  const filename = `goście-${event.title.replace(/\s/g, '-')}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
