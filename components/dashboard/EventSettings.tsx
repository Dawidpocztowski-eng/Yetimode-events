'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { Save, Trash2, Globe, EyeOff, ExternalLink, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Props { event: Event; onUpdate: (e: Event) => void }

export default function EventSettings({ event, onUpdate }: Props) {
  const router = useRouter()
  const supabase = createClient()

  // --- Formularz główny ---
  const [form, setForm] = useState({
    title: event.title, date: event.date, time: event.time || '',
    venue_name: event.venue_name || '', venue_city: event.venue_city || '',
    description: event.description || '', primary_color: event.primary_color,
    gallery_code: event.gallery_code,
    partner1_name: event.partner1_name || '', partner2_name: event.partner2_name || '',
    church_name: event.church_name || '', church_time: event.church_time || '',
  })
  const [saving, setSaving] = useState(false)

  // --- Formularz kontaktów (para + świadkowie) — osobny ---
  const [contacts, setContacts] = useState({
    partner1_phone: event.partner1_phone || '',
    partner2_phone: event.partner2_phone || '',
    best_man_name: event.best_man_name || '',
    best_man_phone: event.best_man_phone || '',
    maid_of_honor_name: event.maid_of_honor_name || '',
    maid_of_honor_phone: event.maid_of_honor_phone || '',
    show_contacts: event.show_contacts ?? false,
  })
  const [showContactsPara, setShowContactsPara] = useState(true) // rozwinięta sekcja
  const [savingContacts, setSavingContacts] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const setC = (k: string, v: string | boolean) => setContacts(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    const { data, error } = await supabase.from('events').update({
      title: form.title, date: form.date, time: form.time || null,
      venue_name: form.venue_name || null, venue_city: form.venue_city || null,
      description: form.description || null, primary_color: form.primary_color,
      gallery_code: form.gallery_code,
      partner1_name: form.partner1_name || null, partner2_name: form.partner2_name || null,
      church_name: form.church_name || null, church_time: form.church_time || null,
    }).eq('id', event.id).select().single()
    if (!error && data) { onUpdate(data); toast.success('Zapisano!') }
    else { console.error(error); toast.error('Błąd zapisu') }
    setSaving(false)
  }

  const saveContacts = async () => {
    setSavingContacts(true)
    const payload: Record<string, string | boolean | null> = {
      partner1_phone: contacts.partner1_phone || null,
      partner2_phone: contacts.partner2_phone || null,
      best_man_name: contacts.best_man_name || null,
      best_man_phone: contacts.best_man_phone || null,
      maid_of_honor_name: contacts.maid_of_honor_name || null,
      maid_of_honor_phone: contacts.maid_of_honor_phone || null,
      show_contacts: contacts.show_contacts,
    }
    const { data, error } = await supabase.from('events').update(payload).eq('id', event.id).select().single()
    if (!error && data) { onUpdate(data); toast.success('Kontakty zapisane!') }
    else {
      console.error('Contacts save error:', error)
      // Kolumny mogą nie istnieć w bazie — informuj dokładnie
      toast.error(`Błąd: ${error?.message || 'Sprawdź czy kolumny istnieją w Supabase'}`)
    }
    setSavingContacts(false)
  }

  const togglePublish = async () => {
    const { data, error } = await supabase.from('events').update({ is_published: !event.is_published }).eq('id', event.id).select().single()
    if (!error && data) { onUpdate(data); toast.success(data.is_published ? 'Opublikowano!' : 'Ukryto') }
  }

  const deleteEvent = async () => {
    if (!confirm('Czy na pewno chcesz usunąć to wydarzenie?')) return
    setDeleting(true)
    await supabase.from('events').delete().eq('id', event.id)
    toast.success('Wydarzenie usunięte')
    router.push('/dashboard')
  }

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-white text-lg">Ustawienia</h2>

      {/* Status */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="font-medium text-white text-sm">Status strony</p>
          <p className="text-xs text-gray-500">{event.is_published ? 'Widoczna dla gości' : 'Ukryta'}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/e/${event.slug}`} target="_blank" rel="noreferrer" className="btn-secondary py-2 px-3 text-sm">
            <ExternalLink size={14} /> Podgląd
          </a>
          <button onClick={togglePublish} className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
            event.is_published ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10' : 'bg-green-500 text-white hover:bg-green-600'
          }`}>
            {event.is_published ? <><EyeOff size={14}/> Ukryj</> : <><Globe size={14}/> Opublikuj</>}
          </button>
        </div>
      </div>

      {/* Formularz główny */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-300 text-sm">Dane wydarzenia</h3>
        <div><label className="label">Nazwa</label><input value={form.title} onChange={e => set('title', e.target.value)} className="input" /></div>
        {event.type === 'wedding' && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Panna Młoda</label><input value={form.partner1_name} onChange={e => set('partner1_name', e.target.value)} className="input" /></div>
            <div><label className="label">Pan Młody</label><input value={form.partner2_name} onChange={e => set('partner2_name', e.target.value)} className="input" /></div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Data</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input" /></div>
          <div><label className="label">Godzina</label><input type="time" value={form.time} onChange={e => set('time', e.target.value)} className="input" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Miejsce imprezy</label><input value={form.venue_name} onChange={e => set('venue_name', e.target.value)} className="input" /></div>
          <div><label className="label">Miasto</label><input value={form.venue_city} onChange={e => set('venue_city', e.target.value)} className="input" /></div>
        </div>
        {(event.type === 'wedding' || event.type === 'christening') && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{event.type === 'christening' ? 'Kościół / miejsce chrztu' : 'Kościół'}</label>
              <input value={form.church_name} onChange={e => set('church_name', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">{event.type === 'christening' ? 'Godzina chrztu' : 'Godz. ceremonii'}</label>
              <input type="time" value={form.church_time} onChange={e => set('church_time', e.target.value)} className="input" />
            </div>
          </div>
        )}
        <div><label className="label">Opis</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input resize-none" /></div>
        <div>
          <label className="label">Kolor przewodni</label>
          <div className="flex gap-2 flex-wrap">
            {['#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9','#ef4444','#d4a017','#64748b'].map(c => (
              <button key={c} onClick={() => set('primary_color', c)}
                className={`w-9 h-9 rounded-xl transition-all ${form.primary_color === c ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#13131f] scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div><label className="label">Kod galerii</label><input value={form.gallery_code} onChange={e => set('gallery_code', e.target.value.toUpperCase())} className="input" maxLength={12} /></div>
        <button onClick={save} disabled={saving} className="btn-primary w-full">
          <Save size={16} /> {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </div>

      {/* Kontakty — Para Młoda */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
            <Phone size={15} className="text-violet-400" /> Para Młoda — kontakt
          </h3>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-gray-500">Pokaż na stronie</span>
            <button type="button" onClick={() => setC('show_contacts', !contacts.show_contacts)}
              className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${contacts.show_contacts ? 'bg-violet-600' : 'bg-white/10'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${contacts.show_contacts ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </label>
        </div>
        <p className="text-xs text-gray-600">Numery telefonów widoczne dla gości na stronie głównej.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Panna Młoda — imię</label>
            <input value={form.partner1_name} onChange={e => set('partner1_name', e.target.value)} className="input" placeholder="Agnieszka" />
          </div>
          <div>
            <label className="label">Panna Młoda — telefon</label>
            <input value={contacts.partner1_phone} onChange={e => setC('partner1_phone', e.target.value)} className="input" placeholder="+48 500 000 000" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Pan Młody — imię</label>
            <input value={form.partner2_name} onChange={e => set('partner2_name', e.target.value)} className="input" placeholder="Dawid" />
          </div>
          <div>
            <label className="label">Pan Młody — telefon</label>
            <input value={contacts.partner2_phone} onChange={e => setC('partner2_phone', e.target.value)} className="input" placeholder="+48 500 000 000" />
          </div>
        </div>
        <button onClick={saveContacts} disabled={savingContacts} className="btn-primary w-full">
          <Save size={16} /> {savingContacts ? 'Zapisywanie...' : 'Zapisz kontakty Pary'}
        </button>
      </div>

      {/* Kontakty — Świadkowie */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
          <Phone size={15} className="text-amber-400" /> Świadkowie — kontakt
        </h3>
        <p className="text-xs text-gray-600">Widoczne razem z kontaktami Pary jeśli jest włączone "Pokaż na stronie".</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Świadek — imię</label>
            <input value={contacts.best_man_name} onChange={e => setC('best_man_name', e.target.value)} className="input" placeholder="Imię świadka" />
          </div>
          <div>
            <label className="label">Świadek — telefon</label>
            <input value={contacts.best_man_phone} onChange={e => setC('best_man_phone', e.target.value)} className="input" placeholder="+48 500 000 000" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Świadkowa — imię</label>
            <input value={contacts.maid_of_honor_name} onChange={e => setC('maid_of_honor_name', e.target.value)} className="input" placeholder="Imię świadkowej" />
          </div>
          <div>
            <label className="label">Świadkowa — telefon</label>
            <input value={contacts.maid_of_honor_phone} onChange={e => setC('maid_of_honor_phone', e.target.value)} className="input" placeholder="+48 500 000 000" />
          </div>
        </div>
        <button onClick={saveContacts} disabled={savingContacts} className="btn-primary w-full">
          <Save size={16} /> {savingContacts ? 'Zapisywanie...' : 'Zapisz kontakty Świadków'}
        </button>
      </div>

      {/* Usuń */}
      <div className="card border-red-500/20">
        <h3 className="font-semibold text-red-400 text-sm mb-2">Strefa niebezpieczna</h3>
        <p className="text-xs text-gray-500 mb-3">Usunięcie jest nieodwracalne. Wszystkie dane zostaną utracone.</p>
        <button onClick={deleteEvent} disabled={deleting} className="btn-danger">
          <Trash2 size={15} /> {deleting ? 'Usuwanie...' : 'Usuń wydarzenie'}
        </button>
      </div>
    </div>
  )
}

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-white text-lg">Ustawienia</h2>

      {/* Status */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="font-medium text-white text-sm">Status strony</p>
          <p className="text-xs text-gray-500">{event.is_published ? 'Widoczna dla gości' : 'Ukryta'}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/e/${event.slug}`} target="_blank" rel="noreferrer" className="btn-secondary py-2 px-3 text-sm">
            <ExternalLink size={14} /> Podgląd
          </a>
          <button onClick={togglePublish} className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
            event.is_published ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10' : 'bg-green-500 text-white hover:bg-green-600'
          }`}>
            {event.is_published ? <><EyeOff size={14}/> Ukryj</> : <><Globe size={14}/> Opublikuj</>}
          </button>
        </div>
      </div>

      {/* Formularz */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-300 text-sm">Dane wydarzenia</h3>
        <div><label className="label">Nazwa</label><input value={form.title} onChange={e => set('title', e.target.value)} className="input" /></div>
        {event.type === 'wedding' && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Panna Młoda</label><input value={form.partner1_name} onChange={e => set('partner1_name', e.target.value)} className="input" /></div>
            <div><label className="label">Pan Młody</label><input value={form.partner2_name} onChange={e => set('partner2_name', e.target.value)} className="input" /></div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Data</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input" /></div>
          <div><label className="label">Godzina</label><input type="time" value={form.time} onChange={e => set('time', e.target.value)} className="input" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Miejsce imprezy</label><input value={form.venue_name} onChange={e => set('venue_name', e.target.value)} className="input" /></div>
          <div><label className="label">Miasto</label><input value={form.venue_city} onChange={e => set('venue_city', e.target.value)} className="input" /></div>
        </div>
        {(event.type === 'wedding' || event.type === 'christening') && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{event.type === 'christening' ? 'Kościół / miejsce chrztu' : 'Kościół'}</label>
              <input value={form.church_name} onChange={e => set('church_name', e.target.value)} className="input" placeholder={event.type === 'christening' ? 'np. Kościół Św. Jana' : ''} />
            </div>
            <div>
              <label className="label">{event.type === 'christening' ? 'Godzina chrztu' : 'Godz. ceremonii'}</label>
              <input type="time" value={form.church_time} onChange={e => set('church_time', e.target.value)} className="input" />
            </div>
          </div>
        )}
        <div><label className="label">Opis</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input resize-none" /></div>
        <div>
          <label className="label">Kolor przewodni</label>
          <div className="flex gap-2 flex-wrap">
            {['#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9','#ef4444','#d4a017','#64748b'].map(c => (
              <button key={c} onClick={() => set('primary_color', c)}
                className={`w-9 h-9 rounded-xl transition-all ${form.primary_color === c ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#13131f] scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div><label className="label">Kod galerii</label><input value={form.gallery_code} onChange={e => set('gallery_code', e.target.value.toUpperCase())} className="input" maxLength={12} /></div>
        <button onClick={save} disabled={saving} className="btn-primary w-full">
          <Save size={16} /> {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </div>

      {/* Kontakty widoczne dla gości */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-300 text-sm">Kontakty dla gości</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-500">Pokaż na stronie</span>
            <button type="button" onClick={() => set('show_contacts', form.show_contacts ? '' : 'true')}
              className={`relative w-11 h-6 rounded-full transition-all duration-200 ${form.show_contacts ? 'bg-violet-600' : 'bg-white/10'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${form.show_contacts ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
            </button>
          </label>
        </div>
        <p className="text-xs text-gray-600">Numery telefonów będą widoczne dla gości na stronie głównej jeśli włączysz pokazywanie kontaktów.</p>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Panna Młoda — imię</label><input value={form.partner1_name} onChange={e => set('partner1_name', e.target.value)} className="input" placeholder="Agnieszka" /></div>
          <div><label className="label">Panna Młoda — telefon</label><input value={form.partner1_phone} onChange={e => set('partner1_phone', e.target.value)} className="input" placeholder="+48 500 000 000" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Pan Młody — imię</label><input value={form.partner2_name} onChange={e => set('partner2_name', e.target.value)} className="input" placeholder="Dawid" /></div>
          <div><label className="label">Pan Młody — telefon</label><input value={form.partner2_phone} onChange={e => set('partner2_phone', e.target.value)} className="input" placeholder="+48 500 000 000" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Świadek — imię</label><input value={form.best_man_name} onChange={e => set('best_man_name', e.target.value)} className="input" placeholder="Imię świadka" /></div>
          <div><label className="label">Świadek — telefon</label><input value={form.best_man_phone} onChange={e => set('best_man_phone', e.target.value)} className="input" placeholder="+48 500 000 000" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Świadkowa — imię</label><input value={form.maid_of_honor_name} onChange={e => set('maid_of_honor_name', e.target.value)} className="input" placeholder="Imię świadkowej" /></div>
          <div><label className="label">Świadkowa — telefon</label><input value={form.maid_of_honor_phone} onChange={e => set('maid_of_honor_phone', e.target.value)} className="input" placeholder="+48 500 000 000" /></div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full">
          <Save size={16} /> {saving ? 'Zapisywanie...' : 'Zapisz kontakty'}
        </button>
      </div>

      {/* Usuń */}
      <div className="card border-red-500/20">
        <h3 className="font-semibold text-red-400 text-sm mb-2">Strefa niebezpieczna</h3>
        <p className="text-xs text-gray-500 mb-3">Usunięcie jest nieodwracalne. Wszystkie dane zostaną utracone.</p>
        <button onClick={deleteEvent} disabled={deleting} className="btn-danger">
          <Trash2 size={15} /> {deleting ? 'Usuwanie...' : 'Usuń wydarzenie'}
        </button>
      </div>
    </div>
  )
}
