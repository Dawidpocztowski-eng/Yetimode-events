import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'
import { getPlanLimits } from '@/lib/planLimits'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { photo, frame, eventId } = await req.json()

    if (!photo || !eventId) {
      return NextResponse.json({ error: 'Brak danych' }, { status: 400 })
    }

    // Pobierz wydarzenie i właściciela
    const { data: event } = await supabase
      .from('events')
      .select('user_id, gallery_code')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Wydarzenie nie istnieje' }, { status: 404 })
    }

    // Sprawdź plan właściciela
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', event.user_id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const plan = sub?.plan || 'free'
    const limits = getPlanLimits(plan)

    // Sprawdź aktualną liczbę zdjęć
    const { count } = await supabase
      .from('gallery_photos')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (limits.maxPhotos > 0 && (count || 0) >= limits.maxPhotos) {
      return NextResponse.json({
        error: `Osiągnięto limit ${limits.maxPhotos} zdjęć dla planu ${plan}. Upgrade planu aby dodać więcej.`
      }, { status: 403 })
    }

    // Konwertuj base64 na blob i wgraj do Supabase Storage
    const base64Data = photo.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const fileName = `${eventId}/${uuidv4()}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: false })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Błąd uploadu' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName)

    const { error: dbError } = await supabase
      .from('gallery_photos')
      .insert({ event_id: eventId, storage_path: fileName, url: publicUrl, frame: frame || 'none' })

    if (dbError) {
      return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
