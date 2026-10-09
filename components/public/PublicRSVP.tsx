'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import toast from 'react-hot-toast'

export default function PublicRSVP({ event }: { event: Event }) {
  const gold = '#c9a84c'
  const [form, setForm] = useState({ firstName: '', lastName: '', attending: '', guests: '1', accommodation: '', transport: '', dietary: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.attending) { toast.error('Wypełnij wymagane pola'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('rsvp_entries').insert({
      event_id: event.id,
      first_name: form.firstName,
      last_name: form.lastName,
      attending: form.attending === 'yes',
      guests_count: parseInt(form.guests) || 1,
      accommodation: form.accommodation === 'yes',
      transport: form.transport === 'yes',
      dietary_needs: form.dietary || null,
      notes: form.notes || null,
    })
    if (!error) setSubmitted(true)
    else toast.error('Błąd wysyłania')
    setLoading(false)
  }

  if (submitted) return (
    <div className="min-h-screen pt-14 flex items-center justify-center px-4"
      style={{ backgroundColor: '#faf8f3', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <div className="text-center max-w-sm">
        {/* Kompas mały */}
        <div className="flex justify-center mb-6 opacity-50">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="28" stroke={gold} strokeWidth="1" />
            <polygon points="30,4 33,28 30,34 27,28" fill={gold} opacity="0.9" />
            <polygon points="30,56 33,32 30,26 27,32" fill={gold} opacity="0.4" />
            <polygon points="4,30 28,33 34,30 28,27" fill={gold} opacity="0.4" />
            <polygon points="56,30 32,33 26,30 32,27" fill={gold} opacity="0.9" />
            <circle cx="30" cy="30" r="4" fill={gold} opacity="0.5" />
          </svg>
        </div>
        <h2 className="text-3xl font-light mb-3" style={{ color: '#1a1008', letterSpacing: '0.05em' }}>
          Dziękujemy
        </h2>
        <div className="w-12 h-px mx-auto mb-4" style={{ backgroundColor: gold }} />
        <p className="text-stone-500 text-sm font-sans leading-relaxed">
          {form.attending === 'yes'
            ? `Cieszymy się, że będziesz z nami, ${form.firstName}. Do zobaczenia w Szczyrku! ✈`
            : `Szkoda, że nie będziesz mógł/mogła dołączyć, ${form.firstName}.`}
        </p>
      </div>
    </div>
  )

  const inputClass = "w-full bg-transparent border-b py-3 text-sm font-sans placeholder-stone-300 outline-none transition-all text-stone-700"
  const inputStyle = { borderColor: `${gold}40` }
  const inputFocus = `focus:border-[${gold}]`

  const OptionButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick}
      className="flex-1 py-3 text-sm font-sans border transition-all duration-200"
      style={{
        borderColor: active ? gold : `${gold}30`,
        backgroundColor: active ? `${gold}15` : 'transparent',
        color: active ? '#1a1008' : '#a8977a',
      }}>
      {children}
    </button>
  )

  return (
    <section className="min-h-screen pt-14 px-4 overflow-hidden"
      style={{ backgroundColor: '#faf8f3', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* Dekoracja — mapa i samolot w tle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
        <svg viewBox="0 0 1200 600" className="absolute bottom-0 left-0 w-full h-auto">
          <g fill="#c9a84c">
            <ellipse cx="580" cy="200" rx="80" ry="70" />
            <ellipse cx="820" cy="210" rx="160" ry="90" />
            <ellipse cx="590" cy="360" rx="70" ry="100" />
            <ellipse cx="230" cy="230" rx="120" ry="100" />
            <ellipse cx="300" cy="400" rx="70" ry="110" />
            <ellipse cx="950" cy="400" rx="80" ry="60" />
          </g>
        </svg>
      </div>

      <div className="relative max-w-lg mx-auto py-16">

        {/* Header — styl biletu lotniczego */}
        <div className="text-center mb-12">
          {/* Boarding pass header */}
          <div className="border-b mb-6 pb-4" style={{ borderColor: `${gold}30` }}>
            <p className="text-xs tracking-[0.5em] uppercase font-sans mb-2" style={{ color: gold }}>
              ✈ Boarding Pass
            </p>
            <h2 className="text-4xl font-light tracking-[0.05em]" style={{ color: '#1a1008' }}>
              {event.partner1_name && event.partner2_name
                ? `${event.partner1_name} & ${event.partner2_name}`
                : event.title}
            </h2>
            <p className="text-stone-400 text-sm font-sans mt-1 tracking-wider">
              {new Date(event.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
              {event.venue_city ? ` · ${event.venue_city}` : ''}
            </p>
          </div>

          {/* Sekcja PASAŻER */}
          <div className="text-left mb-2">
            <p className="text-xs tracking-[0.3em] uppercase font-sans mb-1" style={{ color: `${gold}99` }}>
              Pasażer:
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Imię i Nazwisko — jak pole "PASAŻEROWIE" na bilecie */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase font-sans mb-2" style={{ color: `${gold}80` }}>Imię *</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Jan" />
            </div>
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase font-sans mb-2" style={{ color: `${gold}80` }}>Nazwisko *</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Kowalski" />
            </div>
          </div>

          {/* Linia perforowana jak na bilecie */}
          <div className="flex items-center gap-2 my-2">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-1 h-px opacity-30" style={{ backgroundColor: gold }} />
            ))}
          </div>

          {/* Cel — CEL: ŚLUB */}
          <div>
            <label className="block text-xs tracking-[0.3em] uppercase font-sans mb-3" style={{ color: `${gold}80` }}>
              Cel — Odprawiam się na: *
            </label>
            <div className="flex gap-2">
              <OptionButton active={form.attending === 'yes'} onClick={() => set('attending', 'yes')}>
                ✓ Tak, będę!
              </OptionButton>
              <OptionButton active={form.attending === 'no'} onClick={() => set('attending', 'no')}>
                ✗ Nie mogę
              </OptionButton>
            </div>
          </div>

          {form.attending === 'yes' && (
            <>
              {/* Liczba osób */}
              <div>
                <label className="block text-xs tracking-[0.3em] uppercase font-sans mb-3" style={{ color: `${gold}80` }}>
                  Liczba pasażerów
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <OptionButton key={n} active={form.guests === String(n)} onClick={() => set('guests', String(n))}>
                      {n}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Nocleg */}
              <div>
                <label className="block text-xs tracking-[0.3em] uppercase font-sans mb-3" style={{ color: `${gold}80` }}>
                  Nocleg w hotelu?
                </label>
                <div className="flex gap-2">
                  <OptionButton active={form.accommodation === 'yes'} onClick={() => set('accommodation', 'yes')}>Tak</OptionButton>
                  <OptionButton active={form.accommodation === 'no'} onClick={() => set('accommodation', 'no')}>Nie</OptionButton>
                </div>
              </div>

              {/* Transport */}
              <div>
                <label className="block text-xs tracking-[0.3em] uppercase font-sans mb-3" style={{ color: `${gold}80` }}>
                  Transport?
                </label>
                <div className="flex gap-2">
                  <OptionButton active={form.transport === 'yes'} onClick={() => set('transport', 'yes')}>Tak</OptionButton>
                  <OptionButton active={form.transport === 'no'} onClick={() => set('transport', 'no')}>Nie</OptionButton>
                </div>
              </div>

              {/* Dieta */}
              <div>
                <label className="block text-xs tracking-[0.25em] uppercase font-sans mb-2" style={{ color: `${gold}80` }}>
                  Dieta / alergie
                </label>
                <input value={form.dietary} onChange={e => set('dietary', e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="np. wegetarianin, gluten..." />
              </div>
            </>
          )}

          {/* Uwagi */}
          <div>
            <label className="block text-xs tracking-[0.25em] uppercase font-sans mb-2" style={{ color: `${gold}80` }}>
              Uwagi dla załogi
            </label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={2} className={`${inputClass} resize-none`} style={inputStyle} />
          </div>

          {/* Linia perforowana */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-1 h-px opacity-20" style={{ backgroundColor: gold }} />
            ))}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-4 text-xs tracking-[0.4em] uppercase font-sans font-medium border transition-all duration-300 disabled:opacity-40"
            style={{ borderColor: gold, color: gold, backgroundColor: `${gold}10` }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = gold
              ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${gold}10`
              ;(e.currentTarget as HTMLButtonElement).style.color = gold
            }}>
            {loading ? 'Wysyłanie...' : '✈ Wyślij potwierdzenie'}
          </button>
        </form>

        {/* Stopka biletu */}
        <div className="text-center mt-10 pt-6 border-t" style={{ borderColor: `${gold}20` }}>
          <p className="text-xs tracking-[0.3em] text-stone-300 uppercase font-sans">
            Widzimy się na miejscu...
          </p>
        </div>
      </div>
    </section>
  )
}
