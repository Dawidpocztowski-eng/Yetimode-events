'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { Users, CheckCircle, ExternalLink, QrCode, Copy, ChevronDown, ChevronUp, Bed, Car, XCircle, Clock, Trash2, Pencil, X, Save } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

export default function EventDashboard({ event }: { event: Event }) {
  const [rsvps, setRsvps] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [showQR, setShowQR] = useState(false)
  const [siteUrl, setSiteUrl] = useState('')
  const [editRsvp, setEditRsvp] = useState<any | null>(null)
  const supabase = createClient()

  const load = async () => {
    const [rsvpRes, guestRes] = await Promise.all([
      supabase.from('rsvp_entries').select('*').eq('event_id', event.id).order('created_at', { ascending: false }),
      supabase.from('guests').select('*').eq('event_id', event.id).order('name'),
    ])
    setRsvps(rsvpRes.data || [])
    setGuests(guestRes.data || [])
  }

  useEffect(() => {
    setSiteUrl(window.location.origin)
    load()
  }, [event.id])

  const deleteRsvp = async (id: string) => {
    if (!confirm('Usunąć to potwierdzenie?')) return
    await supabase.from('rsvp_entries').delete().eq('id', id)
    setRsvps(prev => prev.filter(r => r.id !== id))
    toast.success('Usunięto')
  }

  const saveRsvp = async () => {
    if (!editRsvp) return
    const { error } = await supabase.from('rsvp_entries').update({
      first_name: editRsvp.first_name,
      last_name: editRsvp.last_name,
      attending: editRsvp.attending,
      guests_count: editRsvp.guests_count,
      accommodation: editRsvp.accommodation,
      transport: editRsvp.transport,
      dietary_needs: editRsvp.dietary_needs,
      notes: editRsvp.notes,
    }).eq('id', editRsvp.id)
    if (!error) {
      setRsvps(prev => prev.map(r => r.id === editRsvp.id ? editRsvp : r))
      setEditRsvp(null)
      toast.success('Zaktualizowano!')
    } else {
      toast.error('Błąd zapisu')
    }
  }

  const eventUrl = `${siteUrl}/e/${event.slug}`
  const attending = rsvps.filter(r => r.attending)
  const totalGuests = attending.reduce((s: number, r: any) => s + (r.guests_count || 1), 0)
  const needsAccommodation = attending.filter(r => r.accommodation).length
  const needsTransport = attending.filter(r => r.transport).length
  const unconfirmedGuests = guests.filter(g => !g.confirmed)
  // Pasek: ile gości z listy potwierdziło przez RSVP (dopasowanie po imieniu)
  const rsvpNames = new Set(rsvps.filter(r => r.attending).map(r => `${r.first_name} ${r.last_name}`.toLowerCase().trim()))
  const confirmedFromList = guests.filter(g => rsvpNames.has(g.name.toLowerCase().trim())).length
  const confirmPct = guests.length > 0 ? Math.round((Math.max(confirmedFromList, attending.length) / guests.length) * 100) : attending.length > 0 ? 100 : 0
  const copyLink = () => { navigator.clipboard.writeText(eventUrl); toast.success('Link skopiowany!') }

  return (
    <div className="space-y-5">

      {/* Pasek potwierdzenia */}
      {guests.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">Potwierdzenia z listy gości</p>
            <span className={`text-sm font-bold ${confirmPct >= 80 ? 'text-green-400' : confirmPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{confirmPct}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${confirmPct >= 80 ? 'bg-green-500' : confirmPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.max(confirmPct, attending.length > 0 ? 3 : 0)}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{attending.length} potwierdziło przez RSVP</span>
            <span>{guests.length} na liście</span>
          </div>
        </div>
      )}

      {/* Link */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Strona wydarzenia</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${event.is_published ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
            {event.is_published ? '● Publiczne' : '● Ukryte'}
          </span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-400 font-mono truncate">{eventUrl}</div>
          <button onClick={copyLink} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/10 transition-colors"><Copy size={16} /></button>
          <a href={eventUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 hover:bg-violet-500/20 transition-colors"><ExternalLink size={16} /></a>
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Potwierdzenia', value: attending.length, sub: `z ${rsvps.length} odpowiedzi`, color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
          { label: 'Łącznie gości', value: totalGuests, sub: 'osób na liście', color: 'text-violet-400', bg: 'bg-violet-500/10', icon: Users },
          { label: 'Nocleg', value: needsAccommodation, sub: 'osób potrzebuje', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Bed },
          { label: 'Transport', value: needsTransport, sub: 'osób potrzebuje', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Car },
        ].map(({ label, value, sub, color, bg, icon: Icon }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center`}><Icon size={16} className={color} /></div>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* QR */}
      <div className="card">
        <button onClick={() => setShowQR(!showQR)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-violet-500/10 p-2.5 rounded-xl"><QrCode size={20} className="text-violet-400" /></div>
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
            <p className="text-xs text-gray-500">Kod galerii: <strong className="text-gray-300">{event.gallery_code}</strong></p>
          </div>
        )}
      </div>

      {/* Ostatnie RSVP */}
      {rsvps.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            Potwierdzenia ({rsvps.length})
          </h3>
          <div className="space-y-1">
            {rsvps.map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 group">
                {r.attending
                  ? <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                  : <XCircle size={15} className="text-red-400 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.first_name} {r.last_name}</p>
                  {r.attending && (
                    <div className="flex gap-1.5 mt-0.5">
                      {r.accommodation && <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full">🛏 Nocleg</span>}
                      {r.transport && <span className="text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full">🚗 Transport</span>}
                      {r.guests_count > 1 && <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded-full">{r.guests_count} os.</span>}
                      {r.dietary_needs && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">{r.dietary_needs}</span>}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{format(new Date(r.created_at), 'd MMM', { locale: pl })}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditRsvp({ ...r })} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteRsvp(r.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
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
            <span className="ml-auto text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">{unconfirmedGuests.length}</span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">Goście z listy, którzy jeszcze nie potwierdzili obecności</p>
          <div className="space-y-1">
            {unconfirmedGuests.map(g => (
              <div key={g.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-300 flex-1">{g.name}</span>
                {g.companion_name && <span className="text-xs text-gray-600">+1</span>}
                <span className={`text-xs ${{ family: 'text-rose-400', friends: 'text-blue-400', vendors: 'text-purple-400' }[g.group_type as string] || 'text-gray-500'}`}>
                  {{ family: 'Rodzina', friends: 'Znajomi', vendors: 'Wykonawcy' }[g.group_type as string] || g.group_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal edycji RSVP */}
      {editRsvp && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#101828] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Edytuj potwierdzenie</h3>
              <button onClick={() => setEditRsvp(null)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Imię</label>
                <input value={editRsvp.first_name} onChange={e => setEditRsvp({ ...editRsvp, first_name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Nazwisko</label>
                <input value={editRsvp.last_name} onChange={e => setEditRsvp({ ...editRsvp, last_name: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Obecność</label>
              <div className="flex gap-2">
                {[{ v: true, l: '✓ Tak' }, { v: false, l: '✗ Nie' }].map(({ v, l }) => (
                  <button key={String(v)} onClick={() => setEditRsvp({ ...editRsvp, attending: v })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${editRsvp.attending === v ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {editRsvp.attending && (
              <>
                <div>
                  <label className="label">Liczba osób</label>
                  <select value={editRsvp.guests_count} onChange={e => setEditRsvp({ ...editRsvp, guests_count: parseInt(e.target.value) })} className="input">
                    {[1,2,3,4].map(n => <option key={n} value={n} className="bg-[#101828]">{n}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-2.5 cursor-pointer transition-all text-sm ${editRsvp.accommodation ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                    <input type="checkbox" checked={editRsvp.accommodation} onChange={e => setEditRsvp({ ...editRsvp, accommodation: e.target.checked })} className="hidden" />
                    🛏 Nocleg
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-2.5 cursor-pointer transition-all text-sm ${editRsvp.transport ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                    <input type="checkbox" checked={editRsvp.transport} onChange={e => setEditRsvp({ ...editRsvp, transport: e.target.checked })} className="hidden" />
                    🚗 Transport
                  </label>
                </div>
                <div>
                  <label className="label">Dieta / alergie</label>
                  <input value={editRsvp.dietary_needs || ''} onChange={e => setEditRsvp({ ...editRsvp, dietary_needs: e.target.value })} className="input" placeholder="np. wegetarianin..." />
                </div>
              </>
            )}
            <div>
              <label className="label">Uwagi</label>
              <textarea value={editRsvp.notes || ''} onChange={e => setEditRsvp({ ...editRsvp, notes: e.target.value })} rows={2} className="input resize-none" />
            </div>
            <button onClick={saveRsvp} className="btn-primary w-full">
              <Save size={16} /> Zapisz zmiany
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
