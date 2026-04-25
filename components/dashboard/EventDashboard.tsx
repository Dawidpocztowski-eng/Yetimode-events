'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { Users, CheckCircle, ExternalLink, QrCode, Copy, ChevronDown, ChevronUp, Bed, Car, XCircle, Clock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

export default function EventDashboard({ event }: { event: Event }) {
  const [rsvps, setRsvps] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [showQR, setShowQR] = useState(false)
  const [siteUrl, setSiteUrl] = useState('')

  useEffect(() => {
    setSiteUrl(window.location.origin)
    const load = async () => {
      const supabase = createClient()
      const [rsvpRes, guestRes] = await Promise.all([
        supabase.from('rsvp_entries').select('*').eq('event_id', event.id).order('created_at', { ascending: false }),
        supabase.from('guests').select('*').eq('event_id', event.id).order('name'),
      ])
      setRsvps(rsvpRes.data || [])
      setGuests(guestRes.data || [])
    }
    load()
  }, [event.id])

  const eventUrl = `${siteUrl}/e/${event.slug}`
  const attending = rsvps.filter(r => r.attending)
  const notAttending = rsvps.filter(r => !r.attending)
  const totalGuests = attending.reduce((s: number, r: any) => s + (r.guests_count || 1), 0)
  const needsAccommodation = attending.filter(r => r.accommodation).length
  const needsTransport = attending.filter(r => r.transport).length

  // Goście z listy którzy nie potwierdzili przez RSVP
  const confirmedNames = new Set(rsvps.map(r => `${r.first_name} ${r.last_name}`.toLowerCase()))
  const unconfirmedGuests = guests.filter(g => !g.confirmed)

  // % potwierdzonych (z listy gości)
  const confirmPct = guests.length > 0 ? Math.round((guests.filter(g => g.confirmed).length / guests.length) * 100) : 0

  const copyLink = () => { navigator.clipboard.writeText(eventUrl); toast.success('Link skopiowany!') }

  return (
    <div className="space-y-5">

      {/* Pasek potwierdzenia */}
      {guests.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">Potwierdzenia z listy gości</p>
            <span className={`text-sm font-bold ${confirmPct >= 80 ? 'text-green-400' : confirmPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {confirmPct}%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${confirmPct >= 80 ? 'bg-green-500' : confirmPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${confirmPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{guests.filter(g => g.confirmed).length} potwierdzonych</span>
            <span>{guests.length} na liście</span>
          </div>
        </div>
      )}

      {/* Link */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Strona wydarzenia</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            event.is_published
              ? 'bg-green-500/15 text-green-400 border border-green-500/20'
              : 'bg-white/5 text-gray-400 border border-white/10'
          }`}>
            {event.is_published ? '● Publiczne' : '● Ukryte'}
          </span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-400 font-mono truncate">{eventUrl}</div>
          <button onClick={copyLink} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/10 transition-colors">
            <Copy size={16} />
          </button>
          <a href={eventUrl} target="_blank" rel="noreferrer"
            className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 hover:bg-violet-500/20 transition-colors">
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Statystyki — 4 kafelki */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle size={16} className="text-green-400" />
            </div>
            <p className="text-xs text-gray-500">Potwierdzenia</p>
          </div>
          <p className="text-3xl font-bold text-green-400">{attending.length}</p>
          <p className="text-xs text-gray-600 mt-1">z {rsvps.length} odpowiedzi</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-violet-500/10 rounded-xl flex items-center justify-center">
              <Users size={16} className="text-violet-400" />
            </div>
            <p className="text-xs text-gray-500">Łącznie gości</p>
          </div>
          <p className="text-3xl font-bold text-violet-400">{totalGuests}</p>
          <p className="text-xs text-gray-600 mt-1">osób na liście</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Bed size={16} className="text-blue-400" />
            </div>
            <p className="text-xs text-gray-500">Nocleg</p>
          </div>
          <p className="text-3xl font-bold text-blue-400">{needsAccommodation}</p>
          <p className="text-xs text-gray-600 mt-1">osób potrzebuje</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Car size={16} className="text-amber-400" />
            </div>
            <p className="text-xs text-gray-500">Transport</p>
          </div>
          <p className="text-3xl font-bold text-amber-400">{needsTransport}</p>
          <p className="text-xs text-gray-600 mt-1">osób potrzebuje</p>
        </div>
      </div>

      {/* QR */}
      <div className="card">
        <button onClick={() => setShowQR(!showQR)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-violet-500/10 p-2.5 rounded-xl">
              <QrCode size={20} className="text-violet-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-white text-sm">QR Kod RSVP</p>
              <p className="text-xs text-gray-500">Goście skanują i trafiają na formularz</p>
            </div>
          </div>
          {showQR ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
        </button>
        {showQR && (
          <div className="flex flex-col items-center pt-5 gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <QRCodeSVG value={eventUrl} size={180} fgColor={event.primary_color} level="H" />
            </div>
            <p className="text-xs text-gray-500">
              Kod galerii: <strong className="text-gray-300">{event.gallery_code}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Ostatnie RSVP */}
      {rsvps.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            Ostatnie potwierdzenia
          </h3>
          <div className="space-y-1">
            {rsvps.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                {r.attending
                  ? <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                  : <XCircle size={15} className="text-red-400 flex-shrink-0" />
                }
                <span className="text-sm font-medium text-white flex-1">{r.first_name} {r.last_name}</span>
                {r.attending && (
                  <div className="flex gap-1.5">
                    {r.accommodation && <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full">🛏</span>}
                    {r.transport && <span className="text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full">🚗</span>}
                  </div>
                )}
                <span className="text-xs text-gray-600 flex-shrink-0">
                  {format(new Date(r.created_at), 'd MMM', { locale: pl })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Niepotwierdzeni */}
      {unconfirmedGuests.length > 0 && (
        <div className="card border-amber-500/15">
          <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
            <Clock size={16} className="text-amber-400" />
            Oczekują na potwierdzenie
            <span className="ml-auto text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              {unconfirmedGuests.length}
            </span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">Goście z listy, którzy jeszcze nie potwierdzili obecności</p>
          <div className="space-y-1">
            {unconfirmedGuests.map(g => {
              const groupColors: Record<string, string> = {
                family: 'text-rose-400',
                friends: 'text-blue-400',
                vendors: 'text-purple-400',
              }
              const groupLabels: Record<string, string> = {
                family: 'Rodzina',
                friends: 'Znajomi',
                vendors: 'Wykonawcy',
              }
              return (
                <div key={g.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0" />
                  <span className="text-sm text-gray-300 flex-1">{g.name}</span>
                  {g.companion_name && (
                    <span className="text-xs text-gray-600">+1</span>
                  )}
                  <span className={`text-xs ${groupColors[g.group_type] || 'text-gray-500'}`}>
                    {groupLabels[g.group_type] || g.group_type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
