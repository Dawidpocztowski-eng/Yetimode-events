'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { TableItem } from '@/lib/types'
import { Plus, Trash2, Save, RotateCcw, Move } from 'lucide-react'

interface CanvasItem {
  id: string
  type: 'table' | 'label'
  x: number
  y: number
  // for table
  tableId?: string
  // for label
  text?: string
  labelType?: 'stage' | 'dancefloor' | 'entrance' | 'bar' | 'custom'
}

const LABEL_PRESETS = [
  { type: 'stage' as const, emoji: '🎤', text: 'Scena' },
  { type: 'dancefloor' as const, emoji: '💃', text: 'Parkiet' },
  { type: 'entrance' as const, emoji: '🚪', text: 'Wejście' },
  { type: 'bar' as const, emoji: '🍾', text: 'Bar' },
]

const TABLE_W = 80
const TABLE_H = 80
const LABEL_W = 100
const LABEL_H = 44

function TableShape({ shape, name, occupied, capacity, color }: {
  shape: string; name: string; occupied: number; capacity: number; color: string
}) {
  const pct = occupied / capacity
  const fill = pct >= 1 ? '#f87171' : pct > 0.7 ? '#fbbf24' : '#4ade80'

  if (shape === 'round') {
    return (
      <div className="w-full h-full rounded-full flex flex-col items-center justify-center border-2 select-none"
        style={{ borderColor: color, backgroundColor: `${color}15` }}>
        <span className="text-[9px] font-bold text-white leading-tight text-center px-1 truncate w-full text-center">{name}</span>
        <span className="text-[8px] mt-0.5" style={{ color: fill }}>{occupied}/{capacity}</span>
      </div>
    )
  }
  if (shape === 'presidential') {
    return (
      <div className="w-full h-full rounded-sm flex flex-col items-center justify-center border-2 select-none"
        style={{ borderColor: '#f59e0b', backgroundColor: '#f59e0b15' }}>
        <span className="text-[8px] text-amber-300">👑</span>
        <span className="text-[9px] font-bold text-white leading-tight text-center px-1 truncate w-full text-center">{name}</span>
        <span className="text-[8px]" style={{ color: fill }}>{occupied}/{capacity}</span>
      </div>
    )
  }
  return (
    <div className="w-full h-full rounded-lg flex flex-col items-center justify-center border-2 select-none"
      style={{ borderColor: color, backgroundColor: `${color}15` }}>
      <span className="text-[9px] font-bold text-white leading-tight text-center px-1 truncate w-full text-center">{name}</span>
      <span className="text-[8px] mt-0.5" style={{ color: fill }}>{occupied}/{capacity}</span>
    </div>
  )
}

export default function RoomCanvas({
  tables,
  primaryColor,
  onSavePositions,
}: {
  tables: TableItem[]
  primaryColor: string
  onSavePositions: (positions: Record<string, { x: number; y: number }>) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<CanvasItem[]>([])
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState<string | null>(null)
  const [showLabelMenu, setShowLabelMenu] = useState(false)
  const [customLabelText, setCustomLabelText] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Inicjalizacja — rozmieszcz stoliki jeśli nie mają pozycji
  useEffect(() => {
    const tableItems: CanvasItem[] = tables.map((t, i) => ({
      id: `table_${t.id}`,
      type: 'table',
      tableId: t.id,
      x: t.canvas_x ?? 40 + (i % 4) * 120,
      y: t.canvas_y ?? 40 + Math.floor(i / 4) * 120,
    }))
    setItems(prev => {
      // zachowaj istniejące etykiety
      const labels = prev.filter(it => it.type === 'label')
      return [...tableItems, ...labels]
    })
  }, [tables])

  const getItem = (id: string) => items.find(it => it.id === id)

  const onPointerDown = useCallback((e: React.PointerEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const item = items.find(it => it.id === id)
    if (!item) return
    setDragging(id)
    setSelected(id)
    setDragOffset({ x: e.clientX - rect.left - item.x, y: e.clientY - rect.top - item.y })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [items])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - TABLE_W))
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - TABLE_H))
    setItems(prev => prev.map(it => it.id === dragging ? { ...it, x, y } : it))
    setHasChanges(true)
  }, [dragging, dragOffset])

  const onPointerUp = useCallback(() => {
    setDragging(null)
  }, [])

  const addLabel = (preset?: typeof LABEL_PRESETS[0]) => {
    const text = preset ? `${preset.emoji} ${preset.text}` : customLabelText.trim()
    if (!text) return
    const newItem: CanvasItem = {
      id: `label_${Date.now()}`,
      type: 'label',
      text,
      labelType: preset?.type ?? 'custom',
      x: 80,
      y: 80,
    }
    setItems(prev => [...prev, newItem])
    setCustomLabelText('')
    setShowLabelMenu(false)
    setHasChanges(true)
  }

  const deleteSelected = () => {
    if (!selected) return
    // nie pozwól usunąć stolika z canvasu (tylko etykiety)
    const item = getItem(selected)
    if (item?.type === 'table') return
    setItems(prev => prev.filter(it => it.id !== selected))
    setSelected(null)
    setHasChanges(true)
  }

  const savePositions = () => {
    const positions: Record<string, { x: number; y: number }> = {}
    items.filter(it => it.type === 'table' && it.tableId).forEach(it => {
      positions[it.tableId!] = { x: Math.round(it.x), y: Math.round(it.y) }
    })
    onSavePositions(positions)
    setHasChanges(false)
  }

  const resetPositions = () => {
    setItems(prev => prev.map((it, i) => {
      if (it.type !== 'table') return it
      const idx = tables.findIndex(t => t.id === it.tableId)
      return { ...it, x: 40 + (idx % 4) * 120, y: 40 + Math.floor(idx / 4) * 120 }
    }))
    setHasChanges(true)
  }

  const selectedItem = selected ? getItem(selected) : null

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <button
            onClick={() => setShowLabelMenu(!showLabelMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs hover:bg-white/10 transition-all"
          >
            <Plus size={13} /> Dodaj etykietę
          </button>
          {showLabelMenu && (
            <div className="absolute top-full left-0 mt-2 z-20 bg-[#13131f] border border-white/10 rounded-2xl p-3 w-56 space-y-2 shadow-xl">
              <div className="grid grid-cols-2 gap-1.5">
                {LABEL_PRESETS.map(p => (
                  <button key={p.type} onClick={() => addLabel(p)}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-all text-left">
                    {p.emoji} {p.text}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={customLabelText}
                  onChange={e => setCustomLabelText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLabel()}
                  placeholder="Własna etykieta..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-white/20"
                />
                <button onClick={() => addLabel()} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs hover:bg-violet-500 transition-all">+</button>
              </div>
            </div>
          )}
        </div>

        {selectedItem?.type === 'label' && (
          <button onClick={deleteSelected} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all">
            <Trash2 size={13} /> Usuń zaznaczone
          </button>
        )}

        <div className="ml-auto flex gap-2">
          <button onClick={resetPositions} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 transition-all">
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={savePositions} disabled={!hasChanges}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
            style={{ backgroundColor: primaryColor, color: 'white' }}>
            <Save size={13} /> {hasChanges ? 'Zapisz układ' : 'Zapisano'}
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1"><Move size={11} /> Przeciągnij stoliki</span>
        <span className="text-gray-700">·</span>
        <span className="flex items-center gap-1 text-green-600">● wolne</span>
        <span className="flex items-center gap-1 text-amber-500">● &gt;70%</span>
        <span className="flex items-center gap-1 text-red-500">● pełne</span>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full bg-[#0d0d18] border border-white/8 rounded-2xl overflow-hidden select-none touch-none"
        style={{ height: 520, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => setSelected(null)}
      >
        {/* Etykieta sali */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-700 tracking-widest uppercase pointer-events-none">
          Sala weselna
        </div>

        {items.map(item => {
          const isSelected = selected === item.id
          const w = item.type === 'table' ? TABLE_W : LABEL_W
          const h = item.type === 'table' ? TABLE_H : LABEL_H

          if (item.type === 'table') {
            const table = tables.find(t => t.id === item.tableId)
            if (!table) return null
            return (
              <div
                key={item.id}
                className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${isSelected ? 'ring-2 ring-white/30 rounded-full shadow-lg shadow-violet-900/40' : ''}`}
                style={{ left: item.x, top: item.y, width: w, height: h, zIndex: dragging === item.id ? 50 : isSelected ? 10 : 1 }}
                onPointerDown={e => onPointerDown(e, item.id)}
              >
                <TableShape
                  shape={table.shape}
                  name={table.name}
                  occupied={table.seats.length}
                  capacity={table.capacity}
                  color={primaryColor}
                />
              </div>
            )
          }

          // Etykieta
          return (
            <div
              key={item.id}
              className={`absolute cursor-grab active:cursor-grabbing rounded-xl border text-xs font-medium flex items-center justify-center px-2 text-center transition-all ${isSelected ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-gray-400'}`}
              style={{ left: item.x, top: item.y, width: w, height: h, zIndex: dragging === item.id ? 50 : isSelected ? 10 : 1 }}
              onPointerDown={e => onPointerDown(e, item.id)}
            >
              {item.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}
