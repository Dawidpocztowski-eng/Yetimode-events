'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EventType } from '@/lib/types'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import slugify from 'slugify'

const TYPES = [
  { id: 'wedding' as EventType,     emoji: '💍', label: 'Wesele',   desc: 'Ceremonia, wesele, galeria',  gradient: 'from-rose-500/20 to-pink-500/20',   border: 'border-rose-500/30',   active: 'border-rose-400' },
  { id: 'birthday' as EventType,    emoji: '🎂', label: 'Urodziny', desc: 'Przyjęcie, zaproszenia',      gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30',  active: 'border-amber-400' },
  { id: 'christening' as EventType, emoji: '🕊️', label: 'Chrzciny', desc: 'Uroczystość, goście',         gradient: 'from-sky-500/20 to-blue-500/20',    border: 'border-sky-500/30',    active: 'border-sky-400' },
  { id: 'other' as EventType,       emoji: '📅', label: 'Inne',     desc: 'Dowolne wydarzenie',          gradient: 'from-gray-500/20 to-slate-500/20',  border: 'border-gray-500/30',   active: 'border-gray-400' },
]

const COLORS = ['#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9','#ef4444','#d4a017','#64748b']

export default function NewEventPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'wedding' as EventType, title: '', date: '', time: '',
    venue_name: '', venue_city: '', partner1_name: '', partner2_name: '',
    church_name: '', church_time: '', description: '',
    primary_color: '#8b5cf6', gallery_code: '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Wpisz nazwę wydarzenia'); return }
    if (!form.date) { toast.error('Wybierz datę'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Bezpieczny slug — usuwa polskie znaki, fallback na timestamp
    const baseSlug = slugify(form.title, { lower: true, strict: true, locale: 'pl', replacement: '-' })
    const slug = (baseSlug || 'wydarzenie') + '-' + Date.now().toString(36)
    const gallery_code = form.gallery_code.trim() || form.title.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'EVENT'

    const { data, error } = await supabase.from('events').insert({
      user_id: user.id,
      slug,
      type: form.type,
      title: form.title.trim(),
      date: form.date,
      time: form.time || null,
      venue_name: form.venue_name.trim() || null,
      venue_city: form.venue_city.trim() || null,
      description: form.description.trim() || null,
      primary_color: form.primary_color,
      gallery_code,
      is_published: false,
      partner1_name: form.partner1_name.trim() || null,
      partner2_name: form.partner2_name.trim() || null,
      church_name: form.church_name.trim() || null,
      church_time: form.church_time || null,
    }).select().single()

    if (error) {
      console.error('Supabase error:', error)
      toast.error(`Błąd: ${error.message}`)
    } else {
      toast.success('Wydarzenie utworzone! 🎉')
      router.push(`/dashboard/${data.id}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="font-semibold text-white text-sm">Nowe wydarzenie</span>
          </div>
          {/* Progress */}
          <div className="ml-auto flex gap-1.5">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-violet-500 w-8' : 'bg-white/10 w-4'}`} />
            ))}
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Krok 1 */}
        {step === 1 && (
          <div>
            <p className="text-violet-400 text-xs font-medium uppercase tracking-widest mb-2">Krok 1 z 3</p>
            <h2 className="text-2xl font-bold text-white mb-1">Typ wydarzenia</h2>
            <p className="text-gray-500 text-sm mb-8">Wybierz kategorię swojego wydarzenia</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {TYPES.map(t => (
                <button key={t.id} onClick={() => set('type', t.id)}
                  className={`relative bg-gradient-to-br ${t.gradient} border ${form.type === t.id ? t.active : t.border} rounded-2xl p-6 text-left transition-all hover:border-opacity-60 group`}>
                  {form.type === t.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <div className="text-4xl mb-3">{t.emoji}</div>
                  <p className="font-semibold text-white mb-1">{t.label}</p>
                  <p className="text-gray-400 text-xs">{t.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="btn-primary w-full py-3.5">
              Dalej <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Krok 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className="text-violet-400 text-xs font-medium uppercase tracking-widest mb-2">Krok 2 z 3</p>
              <h2 className="text-2xl font-bold text-white mb-1">Szczegóły</h2>
              <p className="text-gray-500 text-sm mb-8">Podstawowe informacje o wydarzeniu</p>
            </div>
            <div>
              <label className="label">Nazwa wydarzenia *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="input"
                placeholder={form.type === 'wedding' ? 'np. Wesele Ani i Piotra' : 'np. Urodziny Marka'} />
            </div>
            {form.type === 'wedding' && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Panna Młoda</label><input value={form.partner1_name} onChange={e => set('partner1_name', e.target.value)} className="input" placeholder="Anna" /></div>
                <div><label className="label">Pan Młody</label><input value={form.partner2_name} onChange={e => set('partner2_name', e.target.value)} className="input" placeholder="Piotr" /></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Data *</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input" /></div>
              <div><label className="label">Godzina</label><input type="time" value={form.time} onChange={e => set('time', e.target.value)} className="input" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Miejsce imprezy</label><input value={form.venue_name} onChange={e => set('venue_name', e.target.value)} className="input" placeholder={form.type === 'christening' ? 'np. Restauracja Złota' : 'Hotel Alpin'} /></div>
              <div><label className="label">Miasto</label><input value={form.venue_city} onChange={e => set('venue_city', e.target.value)} className="input" placeholder="Szczyrk" /></div>
            </div>
            {(form.type === 'wedding' || form.type === 'christening') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{form.type === 'christening' ? 'Kościół / miejsce chrztu' : 'Kościół / ceremonia'}</label>
                  <input value={form.church_name} onChange={e => set('church_name', e.target.value)} className="input" placeholder={form.type === 'christening' ? 'np. Kościół Św. Jana' : 'Sanktuarium...'} />
                </div>
                <div>
                  <label className="label">{form.type === 'christening' ? 'Godzina chrztu' : 'Godzina ceremonii'}</label>
                  <input type="time" value={form.church_time} onChange={e => set('church_time', e.target.value)} className="input" />
                </div>
              </div>
            )}
            <div><label className="label">Opis (opcjonalnie)</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input resize-none" placeholder="Kilka słów dla gości..." /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Wstecz</button>
              <button onClick={() => {
                if (!form.title.trim()) { toast.error('Wpisz nazwę wydarzenia'); return }
                if (!form.date) { toast.error('Wybierz datę'); return }
                setStep(3)
              }} className="btn-primary flex-1">Dalej <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Krok 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-violet-400 text-xs font-medium uppercase tracking-widest mb-2">Krok 3 z 3</p>
              <h2 className="text-2xl font-bold text-white mb-1">Personalizacja</h2>
              <p className="text-gray-500 text-sm mb-8">Dostosuj wygląd strony</p>
            </div>
            <div>
              <label className="label">Kolor przewodni</label>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => set('primary_color', c)}
                    className={`w-10 h-10 rounded-xl transition-all ${form.primary_color === c ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#0a0a0f] scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="label">Kod dostępu do galerii</label>
              <input value={form.gallery_code} onChange={e => set('gallery_code', e.target.value.toUpperCase())} className="input" placeholder="np. WESELE2027" maxLength={12} />
              <p className="text-xs text-gray-600 mt-1.5">Goście podają ten kod aby zobaczyć zdjęcia</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1">Link do strony:</p>
              <p className="text-sm text-violet-400 font-mono break-all">
                yetimode-events.pl/e/{form.title ? (slugify(form.title, { lower: true, strict: true, locale: 'pl' }) || form.title.toLowerCase().replace(/\s+/g, '-')) + '-...' : 'twoje-wydarzenie'}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">Wstecz</button>
              <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 py-3.5">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🎉 Utwórz wydarzenie'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
