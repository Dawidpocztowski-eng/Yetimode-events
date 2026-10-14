'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BedDouble, Plus, X, Save, Search, Users, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'

interface RsvpWithRoom {
  id: string
  first_name: string
  last_name: string
  guests_count: number
  accommodation: boolean
  room: string | null
  dietary_needs: string | null
  notes: string | null
}

export default function EventRooms({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<RsvpWithRoom[]>([])
  const [rooms, setRooms] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editGuest, setEditGuest] = useState<RsvpWithRoom | null>(null)
  const [editRoom, setEditRoom] = useState('')
  const [newRoom, setNewRoom] = useState('')
  const [showAddRoom, setShowAddRoom] = useState(false)
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase
      .from('rsvp_entries')
      .select('id, first_name, last_name, guests_count, accommodation, room, dietary_needs, notes')
      .eq('event_id', eventId)
      .eq('attending', true)
      .eq('accommodation', true)
      .order('last_name')
    setGuests(data || [])
    // Zbierz unikalne pokoje
    const unique = [...new Set((data || []).map(g => g.room).filter(Boolean))] as string[]
    setRooms(unique)
    setLoading(false)
  }
  useEffect(() => { load() }, [eventId])

  const saveRoom = async (id: string, room: string) => {
    const { error } = await supabase.from('rsvp_entries').update({ room: room || null }).eq('id', id)
    if (!error) {
      toast.success('Pokój przypisany!')
      setEditGuest(null)
      load()
    } else {
      toast.error('Błąd zapisu')
    }
  }

  const addRoom = () => {
    if (!newRoom.trim()) return
    if (!rooms.includes(newRoom.trim())) {
      setRooms(prev => [...prev, newRoom.trim()])
    }
    setNewRoom('')
    setShowAddRoom(false)
  }

  const removeRoom = (room: string) => {
    setRooms(prev => prev.filter(r => r !== room))
  }

  // Grupuj gości po pokojach
  const unassigned = guests.filter(g => !g.room || g.room === '')
  const byRoom: Record<string, RsvpWithRoom[]> = {}
  guests.filter(g => g.room).forEach(g => {
    if (!byRoom[g.room!]) byRoom[g.room!] = []
    byRoom[g.room!].push(g)
  })

  const totalNeedingAccommodation = guests.length
  const totalAssigned = guests.filter(g => g.room).length
  const totalPeople = guests.reduce((s, g) => s + (g.guests_count || 1), 0)

  const filtered = (list: RsvpWithRoom[]) =>
    search ? list.filter(g => `${g.first_name} ${g.last_name}`.toLowerCase().includes(search.toLowerCase())) : list

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-lg">Pokoje</h2>
          <p className="text-xs text-gray-500">{totalAssigned}/{totalNeedingAccommodation} gości przypisanych · {totalPeople} osób łącznie</p>
        </div>
        <button onClick={() => setShowAddRoom(true)} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} /> Dodaj pokój
        </button>
      </div>

      {/* Statystyki */}
      {guests.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center">
            <p className="font-bold text-white text-xl">{totalNeedingAccommodation}</p>
            <p className="text-xs text-gray-500">Gości z noclegiem</p>
          </div>
          <div className="card p-3 text-center">
            <p className="font-bold text-green-400 text-xl">{totalAssigned}</p>
            <p className="text-xs text-gray-500">Przypisanych</p>
          </div>
          <div className="card p-3 text-center">
            <p className="font-bold text-amber-400 text-xl">{unassigned.length}</p>
            <p className="text-xs text-gray-500">Bez pokoju</p>
          </div>
        </div>
      )}

      {guests.length === 0 ? (
        <div className="text-center py-16">
          <BedDouble size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Brak gości z zamówionym noclegiem</p>
          <p className="text-gray-600 text-xs mt-1">Gdy goście potwierdzą nocleg w RSVP, pojawią się tutaj</p>
        </div>
      ) : (
        <>
          {/* Wyszukiwarka */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-sm" placeholder="Szukaj gościa..." />
          </div>

          {/* Lista pokoi z gośćmi */}
          {Object.entries(byRoom).map(([room, roomGuests]) => (
            <div key={room} className="card p-0 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5"
                style={{ background: 'linear-gradient(to right, rgba(139,92,246,0.08), transparent)' }}>
                <BedDouble size={16} className="text-violet-400 flex-shrink-0" />
                <span className="font-semibold text-white text-sm flex-1">{room}</span>
                <span className="text-xs text-gray-500">
                  {filtered(roomGuests).length} gości · {filtered(roomGuests).reduce((s, g) => s + (g.guests_count || 1), 0)} osób
                </span>
                <button onClick={() => removeRoom(room)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                  <X size={13} />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {filtered(roomGuests).map(g => (
                  <div key={g.id} className="flex items-center gap-3 px-4 py-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{g.first_name} {g.last_name}</p>
                      <div className="flex gap-2 mt-0.5">
                        {g.guests_count > 1 && <span className="text-xs text-gray-500">{g.guests_count} os.</span>}
                        {g.dietary_needs && <span className="text-xs text-green-400/70">{g.dietary_needs}</span>}
                      </div>
                    </div>
                    <button onClick={() => { setEditGuest(g); setEditRoom(g.room || '') }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all">
                      <Pencil size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Nieprzypisani */}
          {filtered(unassigned).length > 0 && (
            <div className="card p-0 overflow-hidden border-amber-500/15">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5"
                style={{ background: 'rgba(245,158,11,0.06)' }}>
                <Users size={16} className="text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-amber-300 text-sm flex-1">Bez przypisanego pokoju</span>
                <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {filtered(unassigned).length}
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {filtered(unassigned).map(g => (
                  <div key={g.id} className="flex items-center gap-3 px-4 py-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 font-medium">{g.first_name} {g.last_name}</p>
                      <div className="flex gap-2 mt-0.5">
                        {g.guests_count > 1 && <span className="text-xs text-gray-500">{g.guests_count} os.</span>}
                        {g.dietary_needs && <span className="text-xs text-green-400/70">{g.dietary_needs}</span>}
                      </div>
                    </div>
                    <button onClick={() => { setEditGuest(g); setEditRoom('') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-xs font-medium border border-violet-500/20 transition-all opacity-0 group-hover:opacity-100">
                      <BedDouble size={12} /> Przypisz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: dodaj pokój */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Dodaj pokój</h3>
              <button onClick={() => setShowAddRoom(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <div>
              <label className="label">Nazwa pokoju</label>
              <input value={newRoom} onChange={e => setNewRoom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRoom()}
                className="input" placeholder="np. Pokój 101, Apartament, Sypialnia 1..." autoFocus />
            </div>
            {/* Sugestie szybkich nazw */}
            <div className="flex flex-wrap gap-2">
              {['Pokój 101', 'Pokój 102', 'Pokój 103', 'Apartament', 'Sypialnia 1', 'Sypialnia 2'].map(s => (
                <button key={s} onClick={() => setNewRoom(s)}
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 transition-all">
                  {s}
                </button>
              ))}
            </div>
            <button onClick={addRoom} className="btn-primary w-full">
              <Plus size={16} /> Dodaj pokój
            </button>
          </div>
        </div>
      )}

      {/* Modal: przypisz pokój gościowi */}
      {editGuest && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Przypisz pokój</h3>
                <p className="text-xs text-gray-500 mt-0.5">{editGuest.first_name} {editGuest.last_name}</p>
              </div>
              <button onClick={() => setEditGuest(null)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>

            {rooms.length > 0 && (
              <div className="space-y-2">
                <label className="label">Wybierz pokój</label>
                <div className="grid grid-cols-2 gap-2">
                  {rooms.map(room => (
                    <button key={room} onClick={() => setEditRoom(room)}
                      className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
                        editRoom === room
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}>
                      <BedDouble size={14} /> {room}
                    </button>
                  ))}
                  <button onClick={() => setEditRoom('')}
                    className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
                      editRoom === ''
                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                        : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                    }`}>
                    <X size={14} /> Brak
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="label">Lub wpisz ręcznie</label>
              <input value={editRoom} onChange={e => setEditRoom(e.target.value)}
                className="input" placeholder="Nazwa pokoju..." />
            </div>

            <button onClick={() => saveRoom(editGuest.id, editRoom)} className="btn-primary w-full">
              <Save size={16} /> Zapisz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
