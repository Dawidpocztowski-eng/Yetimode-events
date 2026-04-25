'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { ArrowLeft, LayoutDashboard, Users, DollarSign, Grid3X3, Image, Settings } from 'lucide-react'
import EventDashboard from '@/components/dashboard/EventDashboard'
import EventGuests from '@/components/dashboard/EventGuests'
import EventBudget from '@/components/dashboard/EventBudget'
import EventTables from '@/components/dashboard/EventTables'
import EventGallery from '@/components/dashboard/EventGallery'
import EventSettings from '@/components/dashboard/EventSettings'
import EventAdvanced from '@/components/dashboard/EventAdvanced'

const TABS = [
  { id: 'overview',  label: 'Główna',      icon: LayoutDashboard },
  { id: 'guests',    label: 'Goście',      icon: Users },
  { id: 'budget',    label: 'Budżet',      icon: DollarSign },
  { id: 'tables',    label: 'Stoliki',     icon: Grid3X3 },
  { id: 'gallery',   label: 'Galeria',     icon: Image },
  { id: 'advanced',  label: 'Plan & Opcje', icon: Settings },
]

export default function EventPanelPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('events').select('*').eq('id', id).eq('user_id', user.id).single()
      if (!data) { router.push('/dashboard'); return }
      setEvent(data)
      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!event) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {/* Top nav */}
      <nav className="relative z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md px-4 py-3 sticky top-0">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate text-sm">{event.title}</p>
            <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('pl-PL')}</p>
          </div>
          {/* Desktop tabs */}
          <div className="hidden md:flex gap-1">
            {TABS.map(({ id: tid, label, icon: Icon }) => (
              <button key={tid} onClick={() => setActiveTab(tid)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === tid
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'overview'  && <EventDashboard event={event} />}
        {activeTab === 'guests'    && <EventGuests eventId={event.id} />}
        {activeTab === 'budget'    && <EventBudget eventId={event.id} />}
        {activeTab === 'tables'    && <EventTables eventId={event.id} />}
        {activeTab === 'gallery'   && <EventGallery event={event} />}
        {activeTab === 'advanced'  && (
          <div className="space-y-5">
            <EventAdvanced event={event} onUpdate={setEvent} />
            <EventSettings event={event} onUpdate={setEvent} />
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d18]/95 backdrop-blur-md border-t border-white/5 z-40">
        <div className="flex">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button key={tid} onClick={() => setActiveTab(tid)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${
                activeTab === tid ? 'text-violet-400' : 'text-gray-600'
              }`}>
              <Icon size={19} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
