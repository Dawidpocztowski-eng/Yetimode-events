'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event, ScheduleItem } from '@/lib/types'
import { Plus, Trash2, X, Save, GripVertical, Eye, EyeOff, Calendar, Clock, AlarmClock } from 'lucide-react'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

const SCHEDULE_ICONS = ['💍','⛪','📸','🥂','🎵','🍽️','🎂','💃','🎉','🚗','🌙','✨']

const DEFAULT_SECTIONS = {
  countdown: true, church: true, venue: true, description: true,
  rsvp: true, gallery: true, photobooth: true, schedule: true,
}

const SECTION_LABELS: Record<string, string> = {
  countdown: 'Odliczanie do wydarzenia',
  church: 'Kościół / miejsce ceremonii',
  venue: 'Miejsce imprezy',
  description: 'Opis wydarzenia',
  rsvp: 'Formularz RSVP',
  gallery: 'Galeria zdjęć',
  photobooth: 'Foto Budka',
  schedule: 'Plan dnia',
}

interface Props { event: Event; onUpdate: (e: Event) => void }

export default function EventAdvanced({ event, onUpdate }: Props) {
  const supabase = createClient()

  // Widoczność i deadline
  const [visibleFrom, setVisibleFrom] = useState(event.visible_from || '')
  const [rsvpDeadline, setRsvpDeadline] = useState(event.rsvp_deadline || '')
  const [sections, setSections] = useState<Record<string, boolean>>(
    event.visible_sections ? { ...DEFAULT_SECTIONS, ...event.visible_sections } : DEFAULT_SECTIONS
  )
  const [savingSettings, setSavingSettings] = useState(false)

  // Plan dnia
  const [schedule, setSchedule] = useState<ScheduleItem[]>(event.schedule || [])
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({ time: '', title: '', description: '', icon: '🎉' })
  const [savingSchedule, setSavingSchedule] = useState(false)

  const saveSettings = async () => {
    setSavingSettings(true)
    const { data, error } = await supabase.from('events').update({
      visible_from: visibleFrom || null,
      rsvp_deadline: rsvpDeadline || null,
      visible_sections: sections,
    }).eq('id', event.id).select().single()
    if (!error && data) { onUpdate(data); toast.success('Ustawienia zapisane!') }
    else toast.error('Błąd zapisu')
    setSavingSettings(false)
  }

  const addScheduleItem = () => {
    if (!newItem.time || !newItem.title.trim()) { toast.error('Wpisz godzinę i tytuł'); return }
    const item: ScheduleItem = { id: uuidv4(), time: newItem.time, title: newItem.title.trim(), description: newItem.description.trim() || undefined, icon: newItem.icon }
    const sorted = [...schedule, item].sort((a, b) => a.time.localeCompare(b.time))
    setSchedule(sorted)
    setNewItem({ time: '', title: '', description: '', icon: '🎉' })
    setShowAddItem(false)
  }

  const removeScheduleItem = (id: string) => setSchedule(prev => prev.filter(i => i.id !== id))

  const saveSchedule = async () => {
    setSavingSchedule(true)
    const { data, error } = await supabase.from('events').update({ schedule }).eq('id', event.id).select().single()
    if (!error && data) { onUpdate(data); toast.success('Plan dnia zapisany!') }
    else toast.error('Błąd zapisu')
    setSavingSchedule(false)
  }

  const toggleSection = (key: string) => setSections(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-white text-lg">Zaawansowane</h2>

      {/* Widoczność i deadline */}
      <div className="card space-y-5">
        <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
          <Calendar size={16} className="text-violet-400" /> Widoczność i terminy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1.5">
              <Eye size={12} className="text-green-400" /> Strona widoczna od
            </label>
            <input type="date" value={visibleFrom} onChange={e => setVisibleFrom(e.target.value)} className="input" />
            <p className="text-xs text-gray-600 mt-1">Przed tą datą strona będzie ukryta dla gości</p>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <AlarmClock size={12} className="text-amber-400" /> Deadline RSVP
            </label>
            <input type="date" value={rsvpDeadline} onChange={e => setRsvpDeadline(e.target.value)} className="input" />
            <p className="text-xs text-gray-600 mt-1">Po tej dacie formularz RSVP zniknie</p>
          </div>
        </div>

        {/* Sekcje widoczne dla gości */}
        <div>
          <label className="label flex items-center gap-1.5 mb-3">
            <Eye size={12} className="text-violet-400" /> Sekcje widoczne dla gości
          </label>
          <div className="space-y-2">
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-300">{label}</span>
                <button onClick={() => toggleSection(key)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-200 ${sections[key] ? 'bg-violet-600' : 'bg-white/10'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${sections[key] ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={saveSettings} disabled={savingSettings} className="btn-primary w-full">
          <Save size={16} /> {savingSettings ? 'Zapisywanie...' : 'Zapisz ustawienia'}
        </button>
      </div>

      {/* Plan dnia */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
            <Clock size={16} className="text-violet-400" /> Plan dnia
          </h3>
          <button onClick={() => setShowAddItem(true)} className="btn-primary py-1.5 px-3 text-xs">
            <Plus size={14} /> Dodaj
          </button>
        </div>

        {schedule.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Brak pozycji w planie dnia</p>
            <p className="text-gray-600 text-xs mt-1">Dodaj harmonogram wydarzeń dla gości</p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedule.map((item, idx) => (
              <div key={item.id} className="flex items-start gap-3 bg-white/3 border border-white/8 rounded-xl p-3">
                <div className="flex-shrink-0 text-xl mt-0.5">{item.icon || '🎉'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-violet-400 font-mono text-sm font-semibold">{item.time}</span>
                    <span className="text-white text-sm font-medium">{item.title}</span>
                  </div>
                  {item.description && <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>}
                </div>
                <button onClick={() => removeScheduleItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {schedule.length > 0 && (
          <button onClick={saveSchedule} disabled={savingSchedule} className="btn-primary w-full">
            <Save size={16} /> {savingSchedule ? 'Zapisywanie...' : 'Zapisz plan dnia'}
          </button>
        )}
      </div>

      {/* Modal: dodaj pozycję */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Dodaj punkt planu</h3>
              <button onClick={() => setShowAddItem(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>

            {/* Wybór ikony */}
            <div>
              <label className="label">Ikona</label>
              <div className="flex gap-2 flex-wrap">
                {SCHEDULE_ICONS.map(icon => (
                  <button key={icon} onClick={() => setNewItem(f => ({ ...f, icon }))}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newItem.icon === icon ? 'bg-violet-600/30 ring-2 ring-violet-500' : 'bg-white/5 hover:bg-white/10'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Godzina *</label>
                <input type="time" value={newItem.time} onChange={e => setNewItem(f => ({ ...f, time: e.target.value }))} className="input" autoFocus />
              </div>
              <div>
                <label className="label">Tytuł *</label>
                <input value={newItem.title} onChange={e => setNewItem(f => ({ ...f, title: e.target.value }))} className="input" placeholder="np. Ceremonia" />
              </div>
            </div>

            <div>
              <label className="label">Opis (opcjonalnie)</label>
              <input value={newItem.description} onChange={e => setNewItem(f => ({ ...f, description: e.target.value }))} className="input" placeholder="np. Sanktuarium Matki Bożej" />
            </div>

            <button onClick={addScheduleItem} className="btn-primary w-full">
              <Plus size={16} /> Dodaj do planu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
