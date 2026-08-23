'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Guest, TableItem } from '@/lib/types'
import { Plus, Trash2, X, UserPlus, Circle, Users } from 'lucide-react'
import toast from 'react-hot-toast'

// Rozwinięta lista wszystkich osób: główny gość + osoba towarzysząca + dzieci
interface PersonEntry {
  key: string        // unikalny klucz do identyfikacji
  label: string      // wyświetlana nazwa
  parentName: string // główny gość (dla podrzędnych)
  type: 'main' | 'companion' | 'child'
}

function buildPersonList(guests: Guest[]): PersonEntry[] {
  const list: PersonEntry[] = []
  for (const g of guests) {
    list.push({ key: g.name, label: g.name, parentName: g.name, type: 'main' })
    if (g.companion_name) {
      list.push({ key: `${g.name}__companion`, label: g.companion_name, parentName: g.name, type: 'companion' })
    }
    for (const child of g.children || []) {
      list.push({ key: `${g.name}__child__${child.id}`, label: child.name, parentName: g.name, type: 'child' })
    }
  }
  return list
}

export default function EventTables({ eventId }: { eventId: string }) {
  const [tables, setTables] = useState<TableItem[]>([])
  const [allPersons, setAllPersons] = useState<PersonEntry[]>([])
  const [showAddTable, setShowAddTable] = useState(false)
  const [showAddGuest, setShowAddGuest] = useState<string | null>(null)
  const [newTable, setNewTable] = useState({ name: '', shape: 'round' as 'round' | 'rect', capacity: '8' })
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([]) // keys of selected persons
  const supabase = createClient()

  const load = async () => {
    const [tablesRes, guestsRes] = await Promise.all([
      supabase.from('event_tables').select('*').eq('event_id', eventId).order('created_at'),
      supabase.from('guests').select('*').eq('event_id', eventId),
    ])
    setTables((tablesRes.data || []).map((t: any) => ({ ...t, seats: t.seats || [] })))
    const guests: Guest[] = (guestsRes.data || []).map((g: any) => ({
      ...g,
      children: g.children || [],
    }))
    setAllPersons(buildPersonList(guests))
  }
  useEffect(() => { load() }, [eventId])

  const addTable = async () => {
    if (!newTable.name.trim()) { toast.error('Podaj nazwę'); return }
    await supabase.from('event_tables').insert({ event_id: eventId, name: newTable.name.trim(), shape: newTable.shape, capacity: parseInt(newTable.capacity) || 8, seats: [] })
    setNewTable({ name: '', shape: 'round', capacity: '8' }); setShowAddTable(false); load(); toast.success('Stolik dodany!')
  }

  const removeTable = async (id: string) => {
    await supabase.from('event_tables').delete().eq('id', id)
    setTables(prev => prev.filter(t => t.id !== id)); toast.success('Usunięto')
  }

  const addSelectedToTable = async (tableId: string) => {
    if (selected.length === 0) { toast.error('Zaznacz przynajmniej jedną osobę'); return }
    const table = tables.find(t => t.id === tableId); if (!table) return
    const freeSeats = table.capacity - table.seats.length
    if (selected.length > freeSeats) { toast.error(`Za mało miejsca! Wolne miejsca: ${freeSeats}`); return }

    const personsToAdd = allPersons.filter(p => selected.includes(p.key))
    const newSeats = [
      ...table.seats,
      ...personsToAdd.map(p => ({ id: `${Date.now()}_${p.key}`, guest_name: p.label }))
    ]
    await supabase.from('event_tables').update({ seats: newSeats }).eq('id', tableId)
    setSelected([]); setSearch(''); setShowAddGuest(null); load()
    toast.success(`Przydzielono ${selected.length} ${selected.length === 1 ? 'osobę' : 'osoby'}!`)
  }

  const removeGuestFromTable = async (tableId: string, seatId: string) => {
    const table = tables.find(t => t.id === tableId); if (!table) return
    const newSeats = table.seats.filter(s => s.id !== seatId)
    await supabase.from('event_tables').update({ seats: newSeats }).eq('id', tableId)
    load()
  }

  // Osoby już przypisane do jakiegokolwiek stolika
  const assignedNames = new Set(tables.flatMap(t => t.seats.map(s => s.guest_name)))

  const totalSeats = tables.reduce((s, t) => s + t.capacity, 0)
  const occupied = tables.reduce((s, t) => s + t.seats.length, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-lg">Stoliki</h2>
          <p className="text-xs text-gray-500">{occupied}/{totalSeats} miejsc zajętych · {allPersons.length} osób łącznie</p>
        </div>
        <button onClick={() => setShowAddTable(true)} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} /> Dodaj stolik
        </button>
      </div>

      {tables.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Stoliki', v: tables.length }, { label: 'Zajęte', v: occupied }, { label: 'Wolne', v: totalSeats - occupied }].map(({ label, v }) => (
            <div key={label} className="card p-3 text-center">
              <p className="font-bold text-white text-xl">{v}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {tables.length === 0
        ? <p className="text-center text-gray-500 text-sm py-8">Dodaj pierwszy stolik</p>
        : (
          <div className="space-y-3">
            {tables.map(table => {
              const free = table.capacity - table.seats.length
              const pct = (table.seats.length / table.capacity) * 100
              return (
                <div key={table.id} className="card p-0 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                    <div className={`flex-shrink-0 w-10 h-10 border-2 border-violet-500/40 flex items-center justify-center text-violet-400 text-xs font-bold ${table.shape === 'round' ? 'rounded-full' : 'rounded-lg'}`}>
                      {table.seats.length}/{table.capacity}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{table.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-400' : pct > 70 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{free} wolnych</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setShowAddGuest(table.id); setSearch(''); setSelected([]) }} className="p-2 rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"><UserPlus size={15} /></button>
                      <button onClick={() => removeTable(table.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    {table.seats.length === 0
                      ? <p className="text-xs text-gray-600 text-center py-1">Brak gości</p>
                      : (
                        <div className="flex flex-wrap gap-2">
                          {table.seats.map(seat => (
                            <div key={seat.id} className="flex items-center gap-1.5 bg-violet-500/15 text-violet-300 px-3 py-1.5 rounded-full text-xs font-medium">
                              {seat.guest_name}
                              <button onClick={() => removeGuestFromTable(table.id, seat.id)} className="text-violet-500 hover:text-red-400"><X size={11} /></button>
                            </div>
                          ))}
                          {Array.from({ length: free }).map((_, i) => (
                            <div key={`e${i}`} className="flex items-center gap-1 border border-dashed border-white/10 text-gray-600 px-3 py-1.5 rounded-full text-xs">
                              <Circle size={9} /> wolne
                            </div>
                          ))}
                        </div>
                      )
                    }
                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      {/* Modal: dodaj stolik */}
      {showAddTable && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Dodaj stolik</h3>
              <button onClick={() => setShowAddTable(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <input value={newTable.name} onChange={e => setNewTable({ ...newTable, name: e.target.value })} className="input" placeholder="Nazwa stolika" autoFocus />
            <div className="grid grid-cols-2 gap-3">
              {([['round', '⭕ Okrągły'], ['rect', '▭ Prostokątny']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setNewTable({ ...newTable, shape: val })}
                  className={`py-3 rounded-2xl text-sm font-medium transition-all ${newTable.shape === val ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>{label}</button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[4, 6, 8, 10, 12].map(n => (
                <button key={n} onClick={() => setNewTable({ ...newTable, capacity: String(n) })}
                  className={`w-12 h-12 rounded-2xl font-semibold transition-all ${newTable.capacity === String(n) ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>{n}</button>
              ))}
            </div>
            <button onClick={addTable} className="btn-primary w-full">Dodaj stolik</button>
          </div>
        </div>
      )}

      {/* Modal: przydziel gości (multi-select) */}
      {showAddGuest && (() => {
        const table = tables.find(t => t.id === showAddGuest)!
        const freeSeats = table.capacity - table.seats.length
        const alreadyInThisTable = new Set(table.seats.map(s => s.guest_name))

        // Filtruj: nie pokazuj osób już w TYM stoliku ani już przypisanych do jakiegokolwiek
        const filteredPersons = allPersons.filter(p => {
          if (alreadyInThisTable.has(p.label)) return false
          if (assignedNames.has(p.label)) return false
          if (search && !p.label.toLowerCase().includes(search.toLowerCase()) &&
              !p.parentName.toLowerCase().includes(search.toLowerCase())) return false
          return true
        })

        // Grupuj po parentName
        const groups = filteredPersons.reduce<Record<string, PersonEntry[]>>((acc, p) => {
          const key = p.parentName
          if (!acc[key]) acc[key] = []
          acc[key].push(p)
          return acc
        }, {})

        const togglePerson = (key: string) => {
          setSelected(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
          )
        }

        const toggleGroup = (groupPersons: PersonEntry[]) => {
          const keys = groupPersons.map(p => p.key)
          const allSelected = keys.every(k => selected.includes(k))
          if (allSelected) {
            setSelected(prev => prev.filter(k => !keys.includes(k)))
          } else {
            setSelected(prev => [...new Set([...prev, ...keys])])
          }
        }

        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
            <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-lg text-white">Przydziel gości</h3>
                <button onClick={() => { setShowAddGuest(null); setSearch(''); setSelected([]) }} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
              </div>

              <div className="flex items-center justify-between flex-shrink-0">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">{table.name}</strong>
                  <span className="text-gray-500"> · {freeSeats} wolnych miejsc</span>
                </p>
                {selected.length > 0 && (
                  <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">
                    {selected.length} zaznaczonych
                  </span>
                )}
              </div>

              {/* Wyszukiwarka */}
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input flex-shrink-0"
                placeholder="Szukaj po imieniu..."
                autoFocus
              />

              {/* Lista zgrupowana */}
              <div className="overflow-y-auto flex-1 space-y-3 min-h-0 pr-1">
                {Object.entries(groups).length === 0 && (
                  <p className="text-center text-gray-600 text-sm py-4">Brak osób do przydzielenia</p>
                )}
                {Object.entries(groups).map(([parentName, persons]) => {
                  const groupKeys = persons.map(p => p.key)
                  const allGroupSelected = groupKeys.every(k => selected.includes(k))
                  const someGroupSelected = groupKeys.some(k => selected.includes(k))

                  return (
                    <div key={parentName} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                      {/* Nagłówek grupy — kliknięcie zaznacza całą grupę */}
                      <button
                        onClick={() => toggleGroup(persons)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5 ${allGroupSelected ? 'bg-violet-500/10' : ''}`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          allGroupSelected ? 'bg-violet-500 border-violet-500' :
                          someGroupSelected ? 'bg-violet-500/40 border-violet-500/60' :
                          'border-gray-600'
                        }`}>
                          {(allGroupSelected || someGroupSelected) && <span className="text-white text-[10px]">✓</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <Users size={13} className="text-gray-500" />
                          <span className="text-sm font-semibold text-white">{parentName}</span>
                          <span className="text-xs text-gray-600">({persons.length} {persons.length === 1 ? 'osoba' : 'osoby'})</span>
                        </div>
                      </button>

                      {/* Podpersony jeśli jest ich więcej niż 1 */}
                      {persons.length > 1 && (
                        <div className="border-t border-white/5">
                          {persons.map(person => (
                            <button
                              key={person.key}
                              onClick={() => togglePerson(person.key)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/5 ${selected.includes(person.key) ? 'bg-violet-500/10' : ''}`}
                            >
                              <div className="w-4 flex-shrink-0" />
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                selected.includes(person.key) ? 'bg-violet-500 border-violet-500' : 'border-gray-600'
                              }`}>
                                {selected.includes(person.key) && <span className="text-white text-[9px]">✓</span>}
                              </div>
                              <span className="text-xs text-gray-300">{person.label}</span>
                              <span className="text-xs text-gray-600 ml-auto">
                                {person.type === 'companion' ? 'towarzysząca' : person.type === 'child' ? 'dziecko' : ''}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Przycisk przydziel */}
              <button
                onClick={() => addSelectedToTable(showAddGuest!)}
                disabled={selected.length === 0}
                className="btn-primary w-full flex-shrink-0 disabled:opacity-40"
              >
                {selected.length === 0
                  ? 'Zaznacz osoby'
                  : `Przydziel ${selected.length} ${selected.length === 1 ? 'osobę' : 'osoby'} →`
                }
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
