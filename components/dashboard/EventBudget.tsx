'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BudgetItem } from '@/lib/types'
import { Plus, Trash2, X, CheckCircle, Circle, ChevronDown, ChevronUp, Pencil, PlusCircle, Save } from 'lucide-react'
import toast from 'react-hot-toast'

type Category = 'sala'|'catering'|'muzyka'|'foto'|'kwiaty'|'suknia'|'transport'|'inne'
const CATEGORIES: Record<Category,{label:string;emoji:string}> = {
  sala:{label:'Sala',emoji:'🏨'}, catering:{label:'Catering',emoji:'🍽️'}, muzyka:{label:'Muzyka',emoji:'🎵'},
  foto:{label:'Foto/Video',emoji:'📷'}, kwiaty:{label:'Kwiaty',emoji:'💐'}, suknia:{label:'Suknia',emoji:'👗'},
  transport:{label:'Transport',emoji:'🚗'}, inne:{label:'Inne',emoji:'📦'},
}
const fmt = (n:number) => n.toLocaleString('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0})
const emptyForm = {name:'',category:'sala' as Category,totalCost:'',note:''}
const emptyDep = {amount:'',date:'',note:'',scanUrl:''}

export default function EventBudget({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<BudgetItem|null>(null)
  const [expandedCat, setExpandedCat] = useState<Category|null>(null)
  const [expandedItem, setExpandedItem] = useState<string|null>(null)
  const [showDepModal, setShowDepModal] = useState<string|null>(null)
  const [form, setForm] = useState(emptyForm)
  const [depForm, setDepForm] = useState(emptyDep)
  const scanRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('budget_items').select('*').eq('event_id', eventId).order('created_at')
    setItems((data||[]).map((i:any)=>({...i,deposits:i.deposits||[]})))
  }
  useEffect(()=>{load()},[eventId])

  const saveItem = async () => {
    if(!form.name||!form.totalCost){toast.error('Wypełnij nazwę i koszt');return}
    const payload = {event_id:eventId,name:form.name.trim(),category:form.category,total_cost:parseFloat(form.totalCost)||0,note:form.note}
    if(editItem){
      await supabase.from('budget_items').update(payload).eq('id',editItem.id)
      toast.success('Zaktualizowano!')
    } else {
      await supabase.from('budget_items').insert({...payload,deposits:[],paid:false})
      toast.success('Dodano!')
    }
    setShowForm(false);setEditItem(null);load()
  }

  const togglePaid = async (item:BudgetItem) => {
    await supabase.from('budget_items').update({paid:!item.paid}).eq('id',item.id)
    setItems(prev=>prev.map(i=>i.id===item.id?{...i,paid:!i.paid}:i))
  }
  const removeItem = async (id:string) => {
    await supabase.from('budget_items').delete().eq('id',id)
    setItems(prev=>prev.filter(i=>i.id!==id));toast.success('Usunięto')
  }
  const handleScan = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = ev => setDepForm(f=>({...f,scanUrl:ev.target?.result as string}))
    reader.readAsDataURL(file)
  }
  const addDeposit = async (itemId:string) => {
    if(!depForm.amount){toast.error('Wpisz kwotę');return}
    const item = items.find(i=>i.id===itemId); if(!item) return
    const dep = {id:Date.now().toString(),amount:parseFloat(depForm.amount)||0,date:depForm.date,note:depForm.note,scan_url:depForm.scanUrl||undefined}
    const newDeps = [...(item.deposits||[]),dep]
    await supabase.from('budget_items').update({deposits:newDeps}).eq('id',itemId)
    setDepForm(emptyDep);setShowDepModal(null);load();toast.success('Zaliczka dodana!')
  }
  const removeDeposit = async (itemId:string,depId:string) => {
    const item = items.find(i=>i.id===itemId); if(!item) return
    const newDeps = item.deposits.filter(d=>d.id!==depId)
    await supabase.from('budget_items').update({deposits:newDeps}).eq('id',itemId)
    load()
  }

  const totalBudget = items.reduce((s,i)=>s+i.total_cost,0)
  const totalDeps = items.reduce((s,i)=>s+(i.deposits||[]).reduce((d:number,dep:any)=>d+dep.amount,0),0)
  const totalPaid = items.filter(i=>i.paid).reduce((s,i)=>s+i.total_cost,0)
  const byCategory = (Object.keys(CATEGORIES) as Category[]).map(cat=>({cat,items:items.filter(i=>i.category===cat)})).filter(g=>g.items.length>0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white text-lg">Budżet</h2>
        <button onClick={()=>{setForm(emptyForm);setEditItem(null);setShowForm(true)}} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16}/> Dodaj
        </button>
      </div>

      {/* Podsumowanie */}
      <div className="rounded-2xl p-5 text-white shadow-lg" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)'}}>
        <p className="text-sm opacity-80 mb-1">Całkowity budżet</p>
        <p className="text-4xl font-bold mb-4">{fmt(totalBudget)}</p>
        <div className="grid grid-cols-3 gap-3">
          {[{label:'Zaliczki',value:totalDeps},{label:'Opłacone',value:totalPaid},{label:'Pozostało',value:Math.max(0,totalBudget-totalPaid-totalDeps)}].map(({label,value})=>(
            <div key={label} className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs opacity-80">{label}</p>
              <p className="font-bold text-sm mt-0.5">{fmt(value)}</p>
            </div>
          ))}
        </div>
        {totalBudget>0&&(
          <div className="mt-4">
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{width:`${Math.min(100,((totalPaid+totalDeps)/totalBudget)*100)}%`}}/>
            </div>
            <p className="text-xs opacity-70 mt-1 text-right">{Math.round(((totalPaid+totalDeps)/totalBudget)*100)}% opłacone</p>
          </div>
        )}
      </div>

      {items.length===0
        ? <p className="text-center text-gray-500 text-sm py-8">Dodaj pierwszą pozycję budżetu</p>
        : (
          <div className="space-y-3">
            {byCategory.map(({cat,items:catItems})=>{
              const {label,emoji}=CATEGORIES[cat]
              const catTotal=catItems.reduce((s,i)=>s+i.total_cost,0)
              const catDeps=catItems.reduce((s,i)=>s+(i.deposits||[]).reduce((d:number,dep:any)=>d+dep.amount,0),0)
              const isExp=expandedCat===cat
              return(
                <div key={cat} className="card p-0 overflow-hidden">
                  <button onClick={()=>setExpandedCat(isExp?null:cat)} className="w-full flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{emoji}</div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white text-sm">{label}</p>
                      <p className="text-xs text-gray-500">{catItems.length} poz. · {fmt(catTotal)}</p>
                    </div>
                    <p className="text-xs text-amber-400 mr-2">{fmt(catDeps)} zal.</p>
                    {isExp?<ChevronUp size={16} className="text-gray-500"/>:<ChevronDown size={16} className="text-gray-500"/>}
                  </button>
                  {isExp&&(
                    <div className="border-t border-white/5 divide-y divide-white/5">
                      {catItems.map(item=>{
                        const itemDeps=(item.deposits||[]).reduce((s:number,d:any)=>s+d.amount,0)
                        const isItemExp=expandedItem===item.id
                        return(
                          <div key={item.id} className={item.paid?'bg-green-500/5':''}>
                            <div className="flex items-center gap-3 px-4 py-3">
                              <button onClick={()=>togglePaid(item)} className="flex-shrink-0">
                                {item.paid?<CheckCircle size={20} className="text-green-500"/>:<Circle size={20} className="text-gray-600"/>}
                              </button>
                              <button onClick={()=>setExpandedItem(isItemExp?null:item.id)} className="flex-1 text-left min-w-0">
                                <p className={`text-sm font-medium ${item.paid?'line-through text-gray-600':'text-white'}`}>{item.name}</p>
                                <div className="flex gap-3 mt-0.5 flex-wrap">
                                  <span className="text-xs text-gray-500">{fmt(item.total_cost)}</span>
                                  {itemDeps>0&&<span className="text-xs text-amber-400">Zal: {fmt(itemDeps)}</span>}
                                  {item.note&&<span className="text-xs text-gray-600 italic truncate max-w-[100px]">{item.note}</span>}
                                </div>
                              </button>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={()=>{setShowDepModal(item.id);setDepForm(emptyDep)}} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"><PlusCircle size={14}/></button>
                                <button onClick={()=>{setForm({name:item.name,category:item.category as Category,totalCost:String(item.total_cost),note:item.note||''});setEditItem(item);setShowForm(true)}} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Pencil size={14}/></button>
                                <button onClick={()=>removeItem(item.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14}/></button>
                              </div>
                            </div>
                            {isItemExp&&(item.deposits||[]).length>0&&(
                              <div className="px-4 pb-3 space-y-2">
                                {(item.deposits||[]).map((dep:any)=>(
                                  <div key={dep.id} className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                    {dep.scan_url&&<a href={dep.scan_url} target="_blank" rel="noreferrer"><img src={dep.scan_url} alt="skan" className="w-10 h-10 object-cover rounded-lg"/></a>}
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-amber-400">{fmt(dep.amount)}</p>
                                      {dep.date&&<p className="text-xs text-gray-500">{dep.date}</p>}
                                      {dep.note&&<p className="text-xs text-gray-500 italic">{dep.note}</p>}
                                    </div>
                                    <button onClick={()=>removeDeposit(item.id,dep.id)} className="text-gray-600 hover:text-red-400"><X size={14}/></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      }

      {/* Modal: dodaj/edytuj */}
      {showForm&&(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">{editItem?'Edytuj':'Dodaj pozycję'}</h3>
              <button onClick={()=>setShowForm(false)} className="text-gray-500 hover:text-gray-300"><X size={20}/></button>
            </div>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input" placeholder="Nazwa" autoFocus/>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORIES) as Category[]).map(c=>(
                <button key={c} onClick={()=>setForm({...form,category:c})}
                  className={`py-2 rounded-xl text-xs flex flex-col items-center gap-0.5 transition-all ${form.category===c?'bg-violet-600 text-white':'bg-white/5 text-gray-400 border border-white/10'}`}>
                  <span>{CATEGORIES[c].emoji}</span><span>{CATEGORIES[c].label.split('/')[0]}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="label">Całkowity koszt (zł)</label>
              <input type="number" value={form.totalCost} onChange={e=>setForm({...form,totalCost:e.target.value})} className="input" placeholder="0"/>
            </div>
            <div>
              <label className="label">Notatka</label>
              <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} rows={2} className="input resize-none" placeholder="Kontakt, uwagi..."/>
            </div>
            <button onClick={saveItem} className="btn-primary w-full">
              <Save size={16}/> {editItem?'Zapisz':'Dodaj'}
            </button>
          </div>
        </div>
      )}

      {/* Modal: zaliczka */}
      {showDepModal&&(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center p-4">
          <div className="bg-[#13131f] border border-white/10 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Dodaj zaliczkę</h3>
              <button onClick={()=>setShowDepModal(null)} className="text-gray-500 hover:text-gray-300"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-400">{items.find(i=>i.id===showDepModal)?.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Kwota (zł) *</label><input type="number" value={depForm.amount} onChange={e=>setDepForm({...depForm,amount:e.target.value})} className="input" placeholder="0" autoFocus/></div>
              <div><label className="label">Data</label><input type="date" value={depForm.date} onChange={e=>setDepForm({...depForm,date:e.target.value})} className="input"/></div>
            </div>
            <div><label className="label">Notatka</label><input value={depForm.note} onChange={e=>setDepForm({...depForm,note:e.target.value})} className="input" placeholder="np. przelew, gotówka..."/></div>
            <div>
              <label className="label">Skan / potwierdzenie</label>
              {depForm.scanUrl?(
                <div className="relative">
                  <img src={depForm.scanUrl} alt="skan" className="w-full h-28 object-cover rounded-2xl border border-white/10"/>
                  <button onClick={()=>setDepForm({...depForm,scanUrl:''})} className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-red-400"><X size={14}/></button>
                </div>
              ):(
                <label className="flex items-center gap-3 border-2 border-dashed border-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:border-violet-500/50 transition-colors">
                  <span className="text-sm text-gray-500">Dodaj zdjęcie / skan</span>
                  <input ref={scanRef} type="file" accept="image/*" onChange={handleScan} className="hidden"/>
                </label>
              )}
            </div>
            <button onClick={()=>addDeposit(showDepModal!)} className="btn-primary w-full">Dodaj zaliczkę</button>
          </div>
        </div>
      )}
    </div>
  )
}
