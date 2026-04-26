'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Guest } from '@/lib/types'
import { Plus, Trash2, Users, UserCheck, Briefcase, Search, X, Baby, Heart, Pencil, Save, ChevronDown, ChevronUp, FileDown } from 'lucide-react'
import toast from 'react-hot-toast'

const GROUP_CONFIG = {
  family:  { label: 'Rodzina',   color: 'text-rose-400',   bg: 'bg-rose-500/15',   icon: Users },
  friends: { label: 'Znajomi',   color: 'text-blue-400',   bg: 'bg-blue-500/15',   icon: UserCheck },
  vendors: { label: 'Wykonawcy', color: 'text-purple-400', bg: 'bg-purple-500/15', icon: Briefcase },
}

const emptyForm = { name: '', group_type: 'family' as Guest['group_type'], notes: '', companion_name: '', children: [] as {id:string;name:string}[] }

export default function EventGuests({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [newChildName, setNewChildName] = useState('')
  const supabase = createClient()

  const exportCSV = async () => {
    const a = document.createElement('a')
    a.href = `/api/export/guests?eventId=${eventId}`
    a.download = 'goscie.csv'
    a.click()
  }

  const load = async () => {
    const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).order('created_at')
    setGuests((data || []).map((g: any) => ({ ...g, children: g.children || [] })))
    setLoading(false)
  }
  useEffect(() => { load() }, [eventId])

  const openAdd = () => { setForm(emptyForm); setEditGuest(null); setNewChildName(''); setShowForm(true) }
  const openEdit = (g: Guest) => {
    setForm({ name: g.name, group_type: g.group_type, notes: g.notes || '', companion_name: g.companion_name || '', children: [...(g.children || [])] })
    setEditGuest(g); setNewChildName(''); setShowForm(true)
  }
  const addChild = () => {
    if (!newChildName.trim()) return
    setForm(f => ({ ...f, children: [...f.children, { id: Date.now().toString(), name: newChildName.trim() }] }))
    setNewChildName('')
  }
  const saveGuest = async () => {
    if (!form.name.trim()) { toast.error('Wpisz imię i nazwisko'); return }
    const payload = { event_id: eventId, name: form.name.trim(), group_type: form.group_type, notes: form.notes, companion_name: form.companion_name || null, children: form.children }
    if (editGuest) {
      const { error } = await supabase.from('guests').update(payload).eq('id', editGuest.id)
      if (!error) { toast.success('Zaktualizowano!'); setShowForm(false); load() }
    } else {
      const { error } = await supabase.from('guests').insert({ ...payload, confirmed: false })
      if (!error) { toast.success('Gość dodany!'); setShowForm(false); load() }
    }
  }
  const toggleConfirmed = async (g: Guest) => {
    await supabase.from('guests').update({ confirmed: !g.confirmed }).eq('id', g.id)
    setGuests(prev => prev.map(x => x.id === g.id ? { ...x, confirmed: !x.confirmed } : x))
  }
  const removeGuest = async (id: string) => {
    await supabase.from('guests').delete().eq('id', id)
    setGuests(prev => prev.filter(g => g.id !== id))
    toast.success('Usunięto')
  }

  const filtered = guests.filter(g => {
    const matchGroup = activeGroup === 'all' || g.group_type === activeGroup
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || (g.companion_name || '').toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  })
  const counts = { all: guests.length, family: guests.filter(g => g.group_type === 'family').length, friends: guests.filter(g => g.group_type === 'friends').length, vendors: guests.filter(g => g.group_type === 'vendors').length }
  const confirmed = guests.filter(g => g.confirmed).length
  const totalPersons = guests.reduce((s, g) => s + 1 + (g.companion_name ? 1 : 0) + (g.children?.length || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-lg">Goście</h2>
          <p className="text-xs text-gray-500">{confirmed}/{guests.length} potwierdzonych · {totalPersons} osób łącznie</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} /> Dodaj
        </button>
        <button onClick={exportCSV} className="btn-secondary py-2 px-3 text-sm">
          <FileDown size={15} />
        </button>
      </div>

      {/* Statystyki grup */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(GROUP_CONFIG) as (keyof typeof GROUP_CONFIG)[]).map(g => {
          const { label, color, bg, icon: Icon } = GROUP_CONFIG[g]
          return (
            <div key={g} className="card p-3 text-center">
              <div className={`${bg} ${color} w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1`}><Icon size={15} /></div>
              <p className="font-bold text-white">{counts[g]}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Wyszukiwarka */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Szukaj..." />
      </div>

      {/* Filtry */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'family', 'friends', 'vendors'] as const).map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeGroup === g ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}>
            {g === 'all' ? `Wszyscy (${counts.all})` : `${GROUP_CONFIG[g].label} (${counts[g]})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.map(guest => {
          const { color, bg, icon: Icon } = GROUP_CONFIG[guest.group_type as keyof typeof GROUP_CONFIG] || GROUP_CONFIG.family
          const isExpanded = expandedId === guest.id
          const hasExtra = guest.companion_name || (guest.children?.length || 0) > 0 || guest.notes
          return (
            <div key={guest.id} className="card p-0 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggleConfirmed(guest)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${guest.confirmed ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                  {guest.confirmed && <span className="text-white text-[10px]">✓</span>}
                </button>
                <div className={`${bg} ${color} p-1.5 rounded-lg flex-shrink-0`}><Icon size={13} /></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${guest.confirmed ? 'line-through text-gray-600' : 'text-white'}`}>{guest.name}</p>
                  <div className="flex gap-2 flex-wrap mt-0.5">
                    {guest.companion_name && <span className="flex items-center gap-1 text-xs text-pink-400"><Heart size={9} className="fill-pink-400" />{guest.companion_name}</span>}
                    {(guest.children?.length || 0) > 0 && <span className="flex items-center gap-1 text-xs text-blue-400"><Baby size={9} />{guest.children?.length} dzieci</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {hasExtra && <button onClick={() => setExpandedId(isExpanded ? null : guest.id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-white/5">{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>}
                  <button onClick={() => openEdit(guest)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Pencil size={14} /></button>
                  <button onClick={() => removeGuest(guest.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14} /></button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-3 bg-white/3 border-t border-white/5 space-y-1">
                  {guest.companion_name && <p className="text-xs text-gray-400"><Heart size={10} className="inline text-pink-400 mr-1" />Osoba towarzysząca: <strong className="text-gray-300">{guest.companion_name}</strong></p>}
                  {guest.children?.map(c => <p key={c.id} className="text-xs text-gray-400"><Baby size={10} className="inline text-blue-400 mr-1" />Dziecko: <strong className="text-gray-300">{c.name}</strong></p>)}
                  {guest.notes && <p className="text-xs text-gray-500 italic">{guest.notes}</p>}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && !loading && <p className="text-center text-gray-500 text-sm py-8">{guests.length === 0 ? 'Dodaj pierwszego gościa' : 'Brak wyników'}</p>}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">{editGuest ? 'Edytuj gościa' : 'Dodaj gościa'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Imię i nazwisko" autoFocus />
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(GROUP_CONFIG) as (keyof typeof GROUP_CONFIG)[]).map(g => (
                <button key={g} onClick={() => setForm({ ...form, group_type: g })}
                  className={`py-2 rounded-xl text-xs font-medium transition-all ${form.group_type === g ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                  {GROUP_CONFIG[g].label}
                </button>
              ))}
            </div>
            <div>
              <label className="label flex items-center gap-1"><Heart size={11} className="text-pink-400" /> Osoba towarzysząca</label>
              <input value={form.companion_name} onChange={e => setForm({ ...form, companion_name: e.target.value })} className="input" placeholder="Imię i nazwisko (opcjonalnie)" />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Baby size={11} className="text-blue-400" /> Dzieci</label>
              <div className="flex gap-2 mb-2">
                <input value={newChildName} onChange={e => setNewChildName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChild()} className="input flex-1" placeholder="Imię dziecka" />
                <button onClick={addChild} className="bg-blue-500/15 text-blue-400 px-3 rounded-xl hover:bg-blue-500/25"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.children.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 bg-blue-500/15 text-blue-400 px-3 py-1.5 rounded-full text-xs">
                    <Baby size={10} /> {c.name}
                    <button onClick={() => setForm(f => ({ ...f, children: f.children.filter(x => x.id !== c.id) }))} className="text-blue-500 hover:text-red-400 ml-0.5"><X size={10} /></button>
                  </div>
                ))}
              </div>
            </div>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input" placeholder="Uwagi (opcjonalnie)" />
            <button onClick={saveGuest} className="btn-primary w-full">
              <Save size={16} /> {editGuest ? 'Zapisz zmiany' : 'Dodaj gościa'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
