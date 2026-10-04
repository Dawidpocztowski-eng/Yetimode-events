'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PublicRSVP({ event }: { event: Event }) {
  const color = event.primary_color || '#8b5cf6'
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
    if (!error) { setSubmitted(true) }
    else toast.error('Błąd wysyłania')
    setLoading(false)
  }

  if (submitted) return (
    <div className="min-h-screen pt-14 bg-[#050508] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10"
          style={{ background: `${color}10` }}>
          <CheckCircle size={36} style={{ color }} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-light text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Dziękujemy
        </h2>
        <p className="text-white/40 text-sm font-sans leading-relaxed">
          {form.attending === 'yes'
            ? `Cieszymy się, że będziesz z nami, ${form.firstName}.`
            : `Szkoda, że nie będziesz mógł/mogła dołączyć, ${form.firstName}.`}
        </p>
      </div>
    </div>
  )

  const guestStyle = (active: boolean) => ({
    borderColor: active ? color : 'rgba(255,255,255,0.08)',
    backgroundColor: active ? `${color}15` : 'transparent',
    color: active ? 'white' : 'rgba(255,255,255,0.35)',
  })

  const RadioGroup = ({ name, value, options }: { name: string; value: string; options: { val: string; label: string }[] }) => (
    <div className="flex gap-2">
      {options.map(({ val, label }) => (
        <label key={val}
          className="flex-1 flex items-center justify-center py-3 rounded-xl cursor-pointer transition-all text-sm font-sans border"
          style={guestStyle(value === val)}>
          <input type="radio" name={name} value={val}
            onChange={() => set(name === 'attending' ? 'attending' : name === 'accommodation' ? 'accommodation' : 'transport', val)}
            className="hidden" />
          {label}
        </label>
      ))}
    </div>
  )

  const inputClass = "w-full bg-transparent border-b border-white/10 focus:border-white/30 py-3 text-white text-sm font-sans placeholder-white/20 outline-none transition-all"

  return (
    <section className="min-h-screen pt-14 bg-[#050508] px-4">
      <div className="max-w-lg mx-auto py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/15" />
            <span className="text-white/20 text-xs tracking-[0.4em] uppercase font-sans">Potwierdzenie</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/15" />
          </div>
          <h2 className="text-4xl font-light text-white mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Czy będziesz z nami?
          </h2>
          {event.rsvp_deadline && (
            <p className="text-white/30 text-xs font-sans tracking-wider">
              Prosimy o odpowiedź do {new Date(event.rsvp_deadline).toLocaleDateString('pl-PL')}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Imię i Nazwisko */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white/25 text-xs tracking-[0.2em] uppercase font-sans mb-2">Imię *</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                className={inputClass} placeholder="Jan" />
            </div>
            <div>
              <label className="block text-white/25 text-xs tracking-[0.2em] uppercase font-sans mb-2">Nazwisko *</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                className={inputClass} placeholder="Kowalski" />
            </div>
          </div>

          {/* Obecność */}
          <div>
            <label className="block text-white/25 text-xs tracking-[0.2em] uppercase font-sans mb-3">Obecność *</label>
            <RadioGroup name="attending" value={form.attending} options={[
              { val: 'yes', label: '✓ Tak, będę!' },
              { val: 'no', label: '✗ Nie mogę' }
            ]} />
          </div>

          {form.attending === 'yes' && (
            <>
              {/* Liczba osób */}
              <div>
                <label className="block text-white/25 text-xs tracking-[0.2em] uppercase font-sans mb-3">Liczba osób</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} type="button" onClick={() => set('guests', String(n))}
                      className="w-12 h-12 rounded-xl border text-sm font-sans transition-all"
                      style={guestStyle(form.guests === String(n))}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nocleg */}
              <div>
                <label className="block text-white/25 text-xs tracking-[0.2em] uppercase font-sans mb-3">Nocleg?</label>
                <RadioGroup name="accommodation" value={form.accommodation} options={[
                  { val: 'yes', label: 'Tak' }, { val: 'no', label: 'Nie' }
                ]} />
              </div>

              {/* Transport */}
              <div>
                <label className="block text-white/25 text-xs tracking-[0.2em] uppercase font-sans mb-3">Transport?</label>
                <RadioGroup name="transport" value={form.transport} options={[
                  { val: 'yes', label: 'Tak' }, { val: 'no', label: 'Nie' }
                ]} />
              </div>

              {/* Dieta */}
              <div>
                <label className="block text-white/25 text-xs tracking-[0.2em] uppercase font-sans mb-2">Dieta / alergie</label>
                <input value={form.dietary} onChange={e => set('dietary', e.target.value)}
                  className={inputClass} placeholder="np. wegetarianin, gluten..." />
              </div>
            </>
          )}

          {/* Uwagi */}
          <div>
            <label className="block text-white/25 text-xs tracking-[0.2em] uppercase font-sans mb-2">Uwagi</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={2} className={`${inputClass} resize-none`} />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="w-full relative overflow-hidden py-4 rounded-full font-sans text-sm tracking-[0.2em] uppercase font-medium text-white transition-all duration-300 disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${color}cc, ${color}88)`, boxShadow: `0 8px 40px ${color}20` }}>
              {loading ? 'Wysyłanie...' : 'Wyślij potwierdzenie'}
            </button>
          </div>
        </form>

        {/* Dekoracyjna linia dolna */}
        <div className="flex items-center justify-center mt-14">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </section>
  )
}
