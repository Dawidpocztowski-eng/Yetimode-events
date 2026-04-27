'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { Plus, Heart, PartyPopper, Baby, Calendar, MapPin, ExternalLink, Settings, LogOut, Globe, EyeOff, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import PlanBanner from '@/components/dashboard/PlanBanner'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const TYPE_CONFIG = {
  wedding:     { label: 'Wesele',   icon: Heart,        gradient: 'from-rose-500/20 to-pink-500/20',   border: 'border-rose-500/20',   dot: 'bg-rose-400',   emoji: '💍' },
  birthday:    { label: 'Urodziny', icon: PartyPopper,  gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20',  dot: 'bg-amber-400',  emoji: '🎂' },
  christening: { label: 'Chrzciny', icon: Baby,         gradient: 'from-sky-500/20 to-blue-500/20',    border: 'border-sky-500/20',    dot: 'bg-sky-400',    emoji: '🕊️' },
  other:       { label: 'Inne',     icon: Calendar,     gradient: 'from-gray-500/20 to-slate-500/20',  border: 'border-gray-500/20',   dot: 'bg-gray-400',   emoji: '📅' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
      const { data } = await supabase.from('events').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setEvents(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const togglePublish = async (event: Event) => {
    const supabase = createClient()
    const { error } = await supabase.from('events').update({ is_published: !event.is_published }).eq('id', event.id)
    if (!error) {
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_published: !e.is_published } : e))
      toast.success(event.is_published ? 'Wydarzenie ukryte' : 'Wydarzenie opublikowane!')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Tło */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.png" alt="YetiMode Events" className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{userName}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-sm">
              <LogOut size={15} /> Wyloguj
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Moje wydarzenia</h1>
            <p className="text-gray-500 text-sm mt-1">
              {events.length === 0 ? 'Brak wydarzeń' : `${events.length} ${events.length === 1 ? 'wydarzenie' : 'wydarzeń'}`}
            </p>
          </div>
          <Link href="/dashboard/new" className="btn-primary">
            <Plus size={16} /> Nowe wydarzenie
          </Link>
        </div>

        <div className="mb-6"><PlanBanner /></div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2].map(i => <div key={i} className="card h-44 animate-pulse bg-white/3" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="card text-center py-20">
            <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Calendar size={28} className="text-violet-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Brak wydarzeń</h3>
            <p className="text-gray-500 text-sm mb-8">Utwórz swoje pierwsze wydarzenie i zaproś gości</p>
            <Link href="/dashboard/new" className="btn-primary inline-flex">
              <Plus size={16} /> Utwórz wydarzenie
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(event => {
              const cfg = TYPE_CONFIG[event.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.other
              return (
                <div key={event.id}
                  className={`relative bg-gradient-to-br ${cfg.gradient} border ${cfg.border} rounded-2xl p-5 hover:border-opacity-40 transition-all group overflow-hidden`}>
                  {/* Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 rounded-full blur-2xl group-hover:bg-white/5 transition-all" />

                  <div className="relative flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{cfg.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white truncate">{event.title}</h3>
                        <span className={event.is_published ? 'badge-green' : 'badge-gray'}>
                          <span className={`w-1.5 h-1.5 rounded-full ${event.is_published ? 'bg-green-400' : 'bg-gray-500'}`} />
                          {event.is_published ? 'Publiczne' : 'Ukryte'}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400 mb-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {format(new Date(event.date), 'd MMM yyyy', { locale: pl })}
                        </span>
                        {event.venue_city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {event.venue_city}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Link href={`/dashboard/${event.id}`}
                          className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                          <Settings size={11} /> Panel
                        </Link>
                        <Link href={`/e/${event.slug}`} target="_blank"
                          className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors font-medium">
                          <ExternalLink size={11} /> Podgląd
                        </Link>
                        <button onClick={() => togglePublish(event)}
                          className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors font-medium">
                          {event.is_published ? <><EyeOff size={11} /> Ukryj</> : <><Globe size={11} /> Opublikuj</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
