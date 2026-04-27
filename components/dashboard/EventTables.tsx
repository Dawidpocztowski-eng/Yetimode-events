'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TableItem } from '@/lib/types'
import { Plus, Trash2, X, UserPlus, Circle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EventTables({ eventId }: { eventId: string }) {
  const [tables, setTables] = useState<TableItem[]>([])
  const [guestNames, setGuestNames] = useState<string[]>([])
  const [showAddTable, setShowAddTable] = useState(false)
  const [showAddGuest, setShowAddGuest] = useState<string|null>(null)
  const [newTable, setNewTable] = useState({name:'',shape:'round' as 'round'|'rect',capacity:'8'})
  const [guestInput, setGuestInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const supabase = createClient()

  const load = async () => {
    const [tablesRes, guestsRes] = await Promise.all([
      supabase.from('event_tables').select('*').eq('event_id', eventId).order('created_at'),
      supabase.from('guests').select('name').eq('event_id', eventId),
    ])
    setTables((tablesRes.data||[]).map((t:any)=>({...t,seats:t.seats||[]})))
    setGuestNames((guestsRes.data||[]).map((g:any)=>g.name))
  }
  useEffect(()=>{load()},[eventId])

  const addTable = async () => {
    if(!newTable.name.trim()){toast.error('Podaj nazwę');return}
    await supabase.from('event_tables').insert({event_id:eventId,name:newTable.name.trim(),shape:newTable.shape,capacity:parseInt(newTable.capacity)||8,seats:[]})
    setNewTable({name:'',shape:'round',capacity:'8'});setShowAddTable(false);load();toast.success('Stolik dodany!')
  }
  const removeTable = async (id:string) => {
    await supabase.from('event_tables').delete().eq('id',id)
    setTables(prev=>prev.filter(t=>t.id!==id));toast.success('Usunięto')
  }
  const addGuestToTable = async (tableId:string) => {
    if(!guestInput.trim()){toast.error('Wpisz imię');return}
    const table = tables.find(t=>t.id===tableId); if(!table) return
    if(table.seats.length>=table.capacity){toast.error('Stolik pełny!');return}
    const newSeats=[...table.seats,{id:Date.now().toString(),guest_name:guestInput.trim()}]
    await supabase.from('event_tables').update({seats:newSeats}).eq('id',tableId)
    setGuestInput('');setSuggestions([]);setShowAddGuest(null);load();toast.success('Przydzielono!')
  }
  const removeGuestFromTable = async (tableId:string,seatId:string) => {
    const table=tables.find(t=>t.id===tableId); if(!table) return
    const newSeats=table.seats.filter(s=>s.id!==seatId)
    await supabase.from('event_tables').update({seats:newSeats}).eq('id',tableId)
    load()
  }
  const handleGuestInput = (val:string) => {
    setGuestInput(val)
    setSuggestions(val.length>0?guestNames.filter(n=>n.toLowerCase().includes(val.toLowerCase())).slice(0,5):[])
  }

  const totalSeats=tables.reduce((s,t)=>s+t.capacity,0)
  const occupied=tables.reduce((s,t)=>s+t.seats.length,0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-lg">Stoliki</h2>
          <p className="text-xs text-gray-500">{occupied}/{totalSeats} miejsc zajętych</p>
        </div>
        <button onClick={()=>setShowAddTable(true)} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16}/> Dodaj stolik
        </button>
      </div>

      {tables.length>0&&(
        <div className="grid grid-cols-3 gap-3">
          {[{label:'Stoliki',v:tables.length},{label:'Zajęte',v:occupied},{label:'Wolne',v:totalSeats-occupied}].map(({label,v})=>(
            <div key={label} className="card p-3 text-center">
              <p className="font-bold text-white text-xl">{v}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {tables.length===0
        ? <p className="text-center text-gray-500 text-sm py-8">Dodaj pierwszy stolik</p>
        : (
          <div className="space-y-3">
            {tables.map(table=>{
              const free=table.capacity-table.seats.length
              const pct=(table.seats.length/table.capacity)*100
              return(
                <div key={table.id} className="card p-0 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                    <div className={`flex-shrink-0 w-10 h-10 border-2 border-violet-500/40 flex items-center justify-center text-violet-400 text-xs font-bold ${table.shape==='round'?'rounded-full':'rounded-lg'}`}>
                      {table.seats.length}/{table.capacity}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{table.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct>=100?'bg-red-400':pct>70?'bg-amber-400':'bg-green-400'}`} style={{width:`${pct}%`}}/>
                        </div>
                        <span className="text-xs text-gray-500">{free} wolnych</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={()=>{setShowAddGuest(table.id);setGuestInput('');setSuggestions([])}} className="p-2 rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"><UserPlus size={15}/></button>
                      <button onClick={()=>removeTable(table.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={15}/></button>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    {table.seats.length===0
                      ? <p className="text-xs text-gray-600 text-center py-1">Brak gości</p>
                      : (
                        <div className="flex flex-wrap gap-2">
                          {table.seats.map(seat=>(
                            <div key={seat.id} className="flex items-center gap-1.5 bg-violet-500/15 text-violet-300 px-3 py-1.5 rounded-full text-xs font-medium">
                              {seat.guest_name}
                              <button onClick={()=>removeGuestFromTable(table.id,seat.id)} className="text-violet-500 hover:text-red-400"><X size={11}/></button>
                            </div>
                          ))}
                          {Array.from({length:free}).map((_,i)=>(
                            <div key={`e${i}`} className="flex items-center gap-1 border border-dashed border-white/10 text-gray-600 px-3 py-1.5 rounded-full text-xs">
                              <Circle size={9}/> wolne
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
      {showAddTable&&(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Dodaj stolik</h3>
              <button onClick={()=>setShowAddTable(false)} className="text-gray-500 hover:text-gray-300"><X size={20}/></button>
            </div>
            <input value={newTable.name} onChange={e=>setNewTable({...newTable,name:e.target.value})} className="input" placeholder="Nazwa stolika" autoFocus/>
            <div className="grid grid-cols-2 gap-3">
              {([['round','⭕ Okrągły'],['rect','▭ Prostokątny']] as const).map(([val,label])=>(
                <button key={val} onClick={()=>setNewTable({...newTable,shape:val})}
                  className={`py-3 rounded-2xl text-sm font-medium transition-all ${newTable.shape===val?'bg-violet-600 text-white':'bg-white/5 text-gray-400 border border-white/10'}`}>{label}</button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[4,6,8,10,12].map(n=>(
                <button key={n} onClick={()=>setNewTable({...newTable,capacity:String(n)})}
                  className={`w-12 h-12 rounded-2xl font-semibold transition-all ${newTable.capacity===String(n)?'bg-violet-600 text-white':'bg-white/5 text-gray-400 border border-white/10'}`}>{n}</button>
              ))}
            </div>
            <button onClick={addTable} className="btn-primary w-full">Dodaj stolik</button>
          </div>
        </div>
      )}

      {/* Modal: przydziel gościa */}
      {showAddGuest&&(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-lg text-white">Przydziel gościa</h3>
              <button onClick={()=>{setShowAddGuest(null);setGuestInput('');setSuggestions([])}} className="text-gray-500 hover:text-gray-300"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-400 flex-shrink-0">
              Stolik: <strong className="text-white">{tables.find(t=>t.id===showAddGuest)?.name}</strong>
              {' · '}
              <span className="text-gray-500">
                {tables.find(t=>t.id===showAddGuest)?.seats.length || 0}/{tables.find(t=>t.id===showAddGuest)?.capacity || 0} miejsc
              </span>
            </p>

            {/* Wyszukiwarka */}
            <div className="relative flex-shrink-0">
              <input
                value={guestInput}
                onChange={e => { setGuestInput(e.target.value); setSuggestions([]) }}
                className="input"
                placeholder="Szukaj gościa..."
                autoFocus
              />
            </div>

            {/* Lista gości z checkboxami */}
            <div className="overflow-y-auto flex-1 space-y-1 min-h-0">
              {guestNames
                .filter(name => {
                  // Filtruj po wyszukiwarce
                  if (guestInput && !name.toLowerCase().includes(guestInput.toLowerCase())) return false
                  // Ukryj już przydzielonych do tego stolika
                  const table = tables.find(t => t.id === showAddGuest)
                  if (table?.seats.some(s => s.guest_name === name)) return false
                  return true
                })
                .map(name => (
                  <button
                    key={name}
                    onClick={() => { setGuestInput(name); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      guestInput === name
                        ? 'bg-violet-500/20 border border-violet-500/30 text-white'
                        : 'bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      guestInput === name ? 'bg-violet-500 border-violet-500' : 'border-gray-600'
                    }`}>
                      {guestInput === name && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className="text-sm font-medium">{name}</span>
                  </button>
                ))
              }
              {guestNames.filter(n => !guestInput || n.toLowerCase().includes(guestInput.toLowerCase())).length === 0 && (
                <p className="text-center text-gray-600 text-sm py-4">Brak gości do przydzielenia</p>
              )}
            </div>

            {/* Wpisz ręcznie jeśli nie ma na liście */}
            {guestInput && !guestNames.includes(guestInput) && (
              <p className="text-xs text-gray-500 flex-shrink-0">
                Nie ma na liście? Zostanie dodany jako: <strong className="text-gray-300">{guestInput}</strong>
              </p>
            )}

            <button
              onClick={() => addGuestToTable(showAddGuest!)}
              disabled={!guestInput.trim()}
              className="btn-primary w-full flex-shrink-0"
              style={{ background: guestInput.trim() ? 'linear-gradient(135deg, #146EF5, #22D3EE)' : undefined }}
            >
              Przydziel: {guestInput || '—'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
