'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BudgetItem } from '@/lib/types'
import { Plus, Trash2, X, CheckCircle, Circle, ChevronDown, ChevronUp, Pencil, PlusCircle, Save } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Struktura kategorii ────────────────────────────────────────────────────
const BUDGET_STRUCTURE = [
  {
    id: 'miejsce', label: 'Miejsce i formalności', emoji: '📍',
    subcategories: ['Sala', 'Ceremonia', 'Opłaty urzędowe', 'Noclegi'],
  },
  {
    id: 'jedzenie', label: 'Jedzenie i napoje', emoji: '🍽️',
    subcategories: ['Catering', 'Tort', 'Alkohol', 'Słodki stół', 'Poprawiny'],
  },
  {
    id: 'rozrywka', label: 'Rozrywka', emoji: '🎶',
    subcategories: ['DJ / Zespół', 'Oprawa ceremonii', 'Atrakcje'],
  },
  {
    id: 'foto', label: 'Foto i wideo', emoji: '📸',
    subcategories: ['Fotograf', 'Kamerzysta', 'Dodatki foto'],
  },
  {
    id: 'styl', label: 'Styl i uroda', emoji: '👗',
    subcategories: ['Suknia', 'Makijaż', 'Fryzura', 'Buty (Panna Młoda)', 'Biżuteria', 'Garnitur', 'Buty (Pan Młody)', 'Fryzjer/Barber'],
  },
  {
    id: 'dekoracje', label: 'Dekoracje', emoji: '🌸',
    subcategories: ['Kwiaty', 'Dekoracje sali', 'Dekoracje ceremonii', 'Oświetlenie'],
  },
  {
    id: 'logistyka', label: 'Logistyka', emoji: '🚗',
    subcategories: ['Transport', 'Wynajem auta', 'Organizacja dnia'],
  },
  {
    id: 'papeteria', label: 'Papeteria', emoji: '📄',
    subcategories: ['Zaproszenia', 'Winietki', 'Menu', 'Plan stołów'],
  },
  {
    id: 'dodatki', label: 'Dodatki', emoji: '🎁',
    subcategories: ['Obrączki', 'Podziękowania dla gości', 'Księga gości'],
  },
  {
    id: 'organizacja', label: 'Organizacja', emoji: '⚙️',
    subcategories: ['Wedding planner', 'Koordynator', 'Przygotowania'],
  },
  {
    id: 'rezerwa', label: 'Rezerwa', emoji: '⚠️',
    subcategories: ['Nieprzewidziane wydatki'],
  },
] as const

type MainCategoryId = typeof BUDGET_STRUCTURE[number]['id']

const fmt = (n: number) => n.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 })
const emptyForm = { name: '', mainCategory: '' as MainCategoryId | '', subcategory: '', totalCost: '', note: '' }
const emptyDep = { amount: '', date: '', note: '', scanUrl: '' }

export default function EventBudget({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<BudgetItem | null>(null)
  const [expandedMain, setExpandedMain] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [showDepModal, setShowDepModal] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [depForm, setDepForm] = useState(emptyDep)
  const scanRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('budget_items').select('*').eq('event_id', eventId).order('created_at')
    setItems((data || []).map((i: any) => ({ ...i, deposits: i.deposits || [] })))
  }
  useEffect(() => { load() }, [eventId])

  const saveItem = async () => {
    if (!form.name || !form.totalCost) { toast.error('Wypełnij nazwę i koszt'); return }
    if (!form.mainCategory) { toast.error('Wybierz kategorię'); return }
    const category = form.subcategory || form.mainCategory
    const payload = { event_id: eventId, name: form.name.trim(), category, total_cost: parseFloat(form.totalCost) || 0, note: form.note }
    if (editItem) {
      await supabase.from('budget_items').update(payload).eq('id', editItem.id)
      toast.success('Zaktualizowano!')
    } else {
      await supabase.from('budget_items').insert({ ...payload, deposits: [], paid: false })
      toast.success('Dodano!')
    }
    setShowForm(false); setEditItem(null); load()
  }

  const togglePaid = async (item: BudgetItem) => {
    await supabase.from('budget_items').update({ paid: !item.paid }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, paid: !i.paid } : i))
  }

  const removeItem = async (id: string) => {
    await supabase.from('budget_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id)); toast.success('Usunięto')
  }

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setDepForm(f => ({ ...f, scanUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const addDeposit = async (itemId: string) => {
    if (!depForm.amount) { toast.error('Wpisz kwotę'); return }
    const item = items.find(i => i.id === itemId); if (!item) return
    const dep = { id: Date.now().toString(), amount: parseFloat(depForm.amount) || 0, date: depForm.date, note: depForm.note, scan_url: depForm.scanUrl || undefined }
    await supabase.from('budget_items').update({ deposits: [...(item.deposits || []), dep] }).eq('id', itemId)
    setDepForm(emptyDep); setShowDepModal(null); load(); toast.success('Zaliczka dodana!')
  }

  const removeDeposit = async (itemId: string, depId: string) => {
    const item = items.find(i => i.id === itemId); if (!item) return
    await supabase.from('budget_items').update({ deposits: item.deposits.filter(d => d.id !== depId) }).eq('id', itemId)
    load()
  }

  // Obliczenia globalne
  const totalBudget = items.reduce((s, i) => s + i.total_cost, 0)
  const totalDeps = items.reduce((s, i) => s + (i.deposits || []).reduce((d: number, dep: any) => d + dep.amount, 0), 0)
  const totalPaid = items.filter(i => i.paid).reduce((s, i) => s + i.total_cost, 0)

  // Grupowanie po głównej kategorii
  const getMainCategory = (category: string) => {
    for (const main of BUDGET_STRUCTURE) {
      if (main.id === category) return main.id
      if ((main.subcategories as readonly string[]).includes(category)) return main.id
    }
    return 'inne'
  }

  const openAdd = (mainCat?: string) => {
    setForm({ ...emptyForm, mainCategory: (mainCat || '') as MainCategoryId | '' })
    setEditItem(null)
    setShowForm(true)
  }

  const openEdit = (item: BudgetItem) => {
    const mainCat = getMainCategory(item.category)
    const sub = BUDGET_STRUCTURE.find(m => m.id === mainCat)?.subcategories.includes(item.category as any) ? item.category : ''
    setForm({ name: item.name, mainCategory: mainCat as MainCategoryId, subcategory: sub, totalCost: String(item.total_cost), note: item.note || '' })
    setEditItem(item)
    setShowForm(true)
  }

  const selectedMain = BUDGET_STRUCTURE.find(m => m.id === form.mainCategory)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white text-lg">Budżet</h2>
        <button onClick={() => openAdd()} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} /> Dodaj
        </button>
      </div>

      {/* Karta podsumowania */}
      <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #146EF5, #22D3EE)' }}>
        <p className="text-sm opacity-80 mb-1">Całkowity budżet</p>
        <p className="text-4xl font-bold mb-4">{fmt(totalBudget)}</p>
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Zaliczki', value: totalDeps }, { label: 'Opłacone', value: totalPaid }, { label: 'Pozostało', value: Math.max(0, totalBudget - totalPaid - totalDeps) }].map(({ label, value }) => (
            <div key={label} className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs opacity-80">{label}</p>
              <p className="font-bold text-sm mt-0.5">{fmt(value)}</p>
            </div>
          ))}
        </div>
        {totalBudget > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, ((totalPaid + totalDeps) / totalBudget) * 100)}%` }} />
            </div>
            <p className="text-xs opacity-70 mt-1 text-right">{Math.round(((totalPaid + totalDeps) / totalBudget) * 100)}% opłacone</p>
          </div>
        )}
      </div>

      {/* Kategorie główne */}
      {items.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">Dodaj pierwszą pozycję budżetu</p>
      ) : (
        <div className="space-y-2">
          {BUDGET_STRUCTURE.map(main => {
            const mainItems = items.filter(i => getMainCategory(i.category) === main.id)
            if (mainItems.length === 0) return null

            const mainTotal = mainItems.reduce((s, i) => s + i.total_cost, 0)
            const mainDeps = mainItems.reduce((s, i) => s + (i.deposits || []).reduce((d: number, dep: any) => d + dep.amount, 0), 0)
            const mainPaid = mainItems.filter(i => i.paid).reduce((s, i) => s + i.total_cost, 0)
            const isExpanded = expandedMain === main.id

            // Grupuj po podkategorii
            const bySubcat: Record<string, BudgetItem[]> = {}
            mainItems.forEach(item => {
              const sub = item.category === main.id ? '(ogólne)' : item.category
              if (!bySubcat[sub]) bySubcat[sub] = []
              bySubcat[sub].push(item)
            })

            return (
              <div key={main.id} className="card p-0 overflow-hidden">
                {/* Nagłówek kategorii głównej */}
                <button
                  onClick={() => setExpandedMain(isExpanded ? null : main.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/3 transition-colors">
                  <span className="text-2xl flex-shrink-0">{main.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white text-sm">{main.label}</p>
                    <p className="text-xs text-gray-500">{mainItems.length} poz. · {fmt(mainTotal)}</p>
                  </div>
                  <div className="text-right mr-2 flex-shrink-0">
                    <p className="text-xs text-amber-400">{fmt(mainDeps)} zal.</p>
                    <p className="text-xs text-green-400">{fmt(mainPaid)} opł.</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); openAdd(main.id) }}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 mr-1 flex-shrink-0">
                    <Plus size={14} />
                  </button>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
                </button>

                {/* Podkategorie */}
                {isExpanded && (
                  <div className="border-t border-white/5">
                    {Object.entries(bySubcat).map(([subcat, subItems]) => {
                      const subTotal = subItems.reduce((s, i) => s + i.total_cost, 0)
                      return (
                        <div key={subcat} className="border-b border-white/5 last:border-0">
                          {/* Nagłówek podkategorii */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex-1">{subcat}</span>
                            <span className="text-xs text-gray-500">{fmt(subTotal)}</span>
                          </div>
                          {/* Pozycje */}
                          {subItems.map(item => {
                            const itemDeps = (item.deposits || []).reduce((s: number, d: any) => s + d.amount, 0)
                            const isItemExp = expandedItem === item.id
                            return (
                              <div key={item.id} className={item.paid ? 'bg-green-500/3' : ''}>
                                <div className="flex items-center gap-3 px-4 py-3">
                                  <button onClick={() => togglePaid(item)} className="flex-shrink-0">
                                    {item.paid ? <CheckCircle size={18} className="text-green-500" /> : <Circle size={18} className="text-gray-600" />}
                                  </button>
                                  <button onClick={() => setExpandedItem(isItemExp ? null : item.id)} className="flex-1 text-left min-w-0">
                                    <p className={`text-sm font-medium ${item.paid ? 'line-through text-gray-600' : 'text-white'}`}>{item.name}</p>
                                    <div className="flex gap-3 mt-0.5 flex-wrap">
                                      <span className="text-xs text-gray-500">{fmt(item.total_cost)}</span>
                                      {itemDeps > 0 && <span className="text-xs text-amber-400">Zal: {fmt(itemDeps)}</span>}
                                      {item.note && <span className="text-xs text-gray-600 italic truncate max-w-[100px]">{item.note}</span>}
                                    </div>
                                  </button>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => { setShowDepModal(item.id); setDepForm(emptyDep) }} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"><PlusCircle size={13} /></button>
                                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Pencil size={13} /></button>
                                    <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={13} /></button>
                                  </div>
                                </div>
                                {/* Zaliczki */}
                                {isItemExp && (item.deposits || []).length > 0 && (
                                  <div className="px-4 pb-3 space-y-2">
                                    {(item.deposits || []).map((dep: any) => (
                                      <div key={dep.id} className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                        {dep.scan_url && <a href={dep.scan_url} target="_blank" rel="noreferrer"><img src={dep.scan_url} alt="skan" className="w-10 h-10 object-cover rounded-lg" /></a>}
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-amber-400">{fmt(dep.amount)}</p>
                                          {dep.date && <p className="text-xs text-gray-500">{dep.date}</p>}
                                          {dep.note && <p className="text-xs text-gray-500 italic">{dep.note}</p>}
                                        </div>
                                        <button onClick={() => removeDeposit(item.id, dep.id)} className="text-gray-600 hover:text-red-400"><X size={14} /></button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: dodaj/edytuj */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#101828] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">{editItem ? 'Edytuj' : 'Dodaj pozycję'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>

            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Nazwa pozycji" autoFocus />

            {/* Wybór kategorii głównej */}
            <div>
              <label className="label">Kategoria główna</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {BUDGET_STRUCTURE.map(main => (
                  <button key={main.id} onClick={() => setForm({ ...form, mainCategory: main.id as MainCategoryId, subcategory: '' })}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${form.mainCategory === main.id ? 'text-white border border-[#146EF5]/50' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
                    style={form.mainCategory === main.id ? { background: 'linear-gradient(135deg, rgba(20,110,245,0.3), rgba(34,211,238,0.1))' } : {}}>
                    <span className="text-lg">{main.emoji}</span>
                    <span className="text-center leading-tight">{main.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wybór podkategorii */}
            {selectedMain && (
              <div>
                <label className="label">Podkategoria (opcjonalnie)</label>
                <div className="flex flex-wrap gap-2">
                  {selectedMain.subcategories.map(sub => (
                    <button key={sub} onClick={() => setForm({ ...form, subcategory: form.subcategory === sub ? '' : sub })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.subcategory === sub ? 'text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
                      style={form.subcategory === sub ? { background: 'linear-gradient(135deg, #146EF5, #22D3EE)' } : {}}>
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="label">Całkowity koszt (zł)</label>
              <input type="number" value={form.totalCost} onChange={e => setForm({ ...form, totalCost: e.target.value })} className="input" placeholder="0" />
            </div>
            <div>
              <label className="label">Notatka</label>
              <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2} className="input resize-none" placeholder="Kontakt, uwagi..." />
            </div>
            <button onClick={saveItem} className="w-full text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #146EF5, #22D3EE)' }}>
              <Save size={16} /> {editItem ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </div>
      )}

      {/* Modal: zaliczka */}
      {showDepModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#101828] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Dodaj zaliczkę</h3>
              <button onClick={() => setShowDepModal(null)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-400">{items.find(i => i.id === showDepModal)?.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Kwota (zł) *</label><input type="number" value={depForm.amount} onChange={e => setDepForm({ ...depForm, amount: e.target.value })} className="input" placeholder="0" autoFocus /></div>
              <div><label className="label">Data</label><input type="date" value={depForm.date} onChange={e => setDepForm({ ...depForm, date: e.target.value })} className="input" /></div>
            </div>
            <div><label className="label">Notatka</label><input value={depForm.note} onChange={e => setDepForm({ ...depForm, note: e.target.value })} className="input" placeholder="np. przelew, gotówka..." /></div>
            <div>
              <label className="label">Skan / potwierdzenie</label>
              {depForm.scanUrl ? (
                <div className="relative"><img src={depForm.scanUrl} alt="skan" className="w-full h-28 object-cover rounded-2xl border border-white/10" /><button onClick={() => setDepForm({ ...depForm, scanUrl: '' })} className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-red-400"><X size={14} /></button></div>
              ) : (
                <label className="flex items-center gap-3 border-2 border-dashed border-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:border-[#146EF5]/50 transition-colors">
                  <span className="text-sm text-gray-500">Dodaj zdjęcie / skan</span>
                  <input ref={scanRef} type="file" accept="image/*" onChange={handleScan} className="hidden" />
                </label>
              )}
            </div>
            <button onClick={() => addDeposit(showDepModal!)} className="w-full text-white font-semibold py-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #146EF5, #22D3EE)' }}>
              Dodaj zaliczkę
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
