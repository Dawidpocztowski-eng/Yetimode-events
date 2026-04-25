'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PublicRSVP({ event }: { event: Event }) {
  const color = event.primary_color || '#0ea5e9'
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
    if (!error) { setSubmitted(true); toast.success('Dziękujemy!') }
    else toast.error('Błąd wysyłania')
    setLoading(false)
  }

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#07070f]">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
          <CheckCircle size={40} style={{ color }} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Dziękujemy!</h2>
        <p className="text-gray-400">{form.attending === 'yes' ? `Cieszymy się, że będziesz z nami, ${form.firstName}! 🎉` : `Szkoda, że nie będziesz mógł/mogła dołączyć, ${form.firstName}.`}</p>
      </div>
    </div>
  )

  const RadioGroup = ({ name, value, options }: { name: string; value: string; options: { val: string; label: string }[] }) => (
    <div className="flex gap-3">
      {options.map(({ val, label }) => (
        <label key={val} className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-all text-sm font-medium ${
          value === val ? 'border-current text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`} style={value === val ? { borderColor: color, backgroundColor: color } : {}}>
          <input type="radio" name={name} value={val} onChange={e => set(name === 'attending' ? 'attending' : name === 'accommodation' ? 'accommodation' : 'transport', e.target.value)} className="hidden" />
          {label}
        </label>
      ))}
    </div>
  )

  return (
    <section className="min-h-screen py-16 px-4 bg-[#07070f]">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Potwierdzenie obecności</h2>
          <p className="text-gray-500 text-sm">Prosimy o odpowiedź do 30 dni przed wydarzeniem</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Imię *</label><input value={form.firstName} onChange={e => set('firstName', e.target.value)} className="input" placeholder="Jan" /></div>
            <div><label className="label">Nazwisko *</label><input value={form.lastName} onChange={e => set('lastName', e.target.value)} className="input" placeholder="Kowalski" /></div>
          </div>
          <div>
            <label className="label">Czy będziesz z nami? *</label>
            <RadioGroup name="attending" value={form.attending} options={[{ val: 'yes', label: '✓ Tak, będę!' }, { val: 'no', label: '✗ Nie mogę' }]} />
          </div>
          {form.attending === 'yes' && (
            <>
              <div>
                <label className="label">Liczba osób</label>
                <select value={form.guests} onChange={e => set('guests', e.target.value)} className="input">
                  {[1,2,3,4].map(n => <option key={n} value={n} className="bg-[#1a1a2e]">{n}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Nocleg?</label>
                <RadioGroup name="accommodation" value={form.accommodation} options={[{ val: 'yes', label: 'Tak' }, { val: 'no', label: 'Nie' }]} />
              </div>
              <div>
                <label className="label">Transport?</label>
                <RadioGroup name="transport" value={form.transport} options={[{ val: 'yes', label: 'Tak' }, { val: 'no', label: 'Nie' }]} />
              </div>
              <div><label className="label">Dieta / alergie</label><input value={form.dietary} onChange={e => set('dietary', e.target.value)} className="input" placeholder="np. wegetarianin, gluten..." /></div>
            </>
          )}
          <div><label className="label">Uwagi</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input resize-none" /></div>
          <button type="submit" disabled={loading}
            className="w-full text-white font-semibold py-4 rounded-2xl transition-all text-base shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 10px 40px ${color}25` }}>
            {loading ? 'Wysyłanie...' : 'Wyślij potwierdzenie →'}
          </button>
        </form>
      </div>
    </section>
  )
}
