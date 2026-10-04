'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import PublicHero from '@/components/public/PublicHero'
import PublicRSVP from '@/components/public/PublicRSVP'
import PublicFotoBudka from '@/components/public/PublicFotoBudka'
import PublicGallery from '@/components/public/PublicGallery'
import PublicSchedule from '@/components/public/PublicSchedule'

const TAB_ICONS: Record<string, string> = {
  home: '✦',
  rsvp: '✉',
  schedule: '◷',
  photobooth: '◉',
  gallery: '◈',
}

export default function PublicEventPage() {
  const { slug } = useParams<{ slug: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('events').select('*').eq('slug', slug).eq('is_published', true).single()
      setEvent(data)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
        <p className="text-white/30 text-xs tracking-widest uppercase">Ładowanie</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-5xl mb-6">🔒</p>
        <h1 className="text-2xl font-semibold text-white mb-3">Strona niedostępna</h1>
        <p className="text-white/40 text-sm">To wydarzenie nie istnieje lub nie zostało jeszcze opublikowane.</p>
      </div>
    </div>
  )

  if (event.visible_from) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (today < new Date(event.visible_from)) return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-5xl mb-6">⏳</p>
          <h1 className="text-2xl font-semibold text-white mb-3">Strona jeszcze niedostępna</h1>
          <p className="text-white/40 text-sm">Dostępna od {new Date(event.visible_from).toLocaleDateString('pl-PL')}</p>
        </div>
      </div>
    )
  }

  const color = event.primary_color || '#8b5cf6'
  const sections = event.visible_sections || {
    countdown: true, church: true, venue: true, description: true,
    rsvp: true, gallery: true, photobooth: true, schedule: true,
  }
  const rsvpExpired = event.rsvp_deadline
    ? new Date() > new Date(event.rsvp_deadline + 'T23:59:59') : false

  const tabs: { label: string; key: string }[] = [
    { label: 'Główna', key: 'home' },
    ...(!rsvpExpired && sections.rsvp ? [{ label: 'RSVP', key: 'rsvp' }] : []),
    ...(sections.schedule && (event.schedule?.length || 0) > 0 ? [{ label: 'Plan dnia', key: 'schedule' }] : []),
    ...(sections.photobooth ? [{ label: 'Foto Budka', key: 'photobooth' }] : []),
    ...(sections.gallery ? [{ label: 'Galeria', key: 'gallery' }] : []),
  ]
  const currentTab = tabs[activeTab]?.key || 'home'

  return (
    <div className="min-h-screen bg-[#050508] text-white" style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-[#050508]/70 backdrop-blur-xl border-b border-white/5" />
        <div className="relative max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Logo / event name */}
          <span className="text-white/60 text-xs tracking-[0.2em] uppercase font-sans font-medium truncate max-w-[140px]">
            {event.title}
          </span>

          {/* Desktop tabs */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab, i) => (
              <button key={tab.key} onClick={() => setActiveTab(i)}
                className={`relative px-4 py-2 text-xs tracking-[0.15em] uppercase font-sans font-medium transition-all duration-300 ${
                  activeTab === i ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}>
                {activeTab === i && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px" style={{ backgroundColor: color }} />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-1"
            aria-label="Menu">
            <span className={`block w-5 h-px bg-white/50 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-px bg-white/50 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-white/50 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a10]/95 backdrop-blur-xl border-b border-white/5 px-5 py-4 space-y-1">
            {tabs.map((tab, i) => (
              <button key={tab.key} onClick={() => { setActiveTab(i); setMenuOpen(false) }}
                className={`w-full text-left py-3 text-sm font-sans tracking-[0.1em] uppercase transition-all border-b border-white/5 last:border-0 ${
                  activeTab === i ? 'text-white' : 'text-white/40'
                }`}
                style={activeTab === i ? { color } : {}}>
                {TAB_ICONS[tab.key] && <span className="mr-3 text-xs">{TAB_ICONS[tab.key]}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Content */}
      <main>
        {currentTab === 'home'       && <PublicHero event={event} sections={sections} onRSVP={() => { const idx = tabs.findIndex(t => t.key === 'rsvp'); if (idx >= 0) setActiveTab(idx) }} />}
        {currentTab === 'rsvp'       && <PublicRSVP event={event} />}
        {currentTab === 'schedule'   && <PublicSchedule event={event} />}
        {currentTab === 'photobooth' && <PublicFotoBudka event={event} />}
        {currentTab === 'gallery'    && <PublicGallery event={event} />}
      </main>

      {rsvpExpired && currentTab === 'home' && (
        <div className="max-w-2xl mx-auto px-4 pb-12">
          <div className="border border-amber-500/20 rounded-2xl p-4 text-center bg-amber-500/5">
            <p className="text-amber-400/80 text-xs tracking-wider font-sans">
              Termin potwierdzenia obecności minął {new Date(event.rsvp_deadline!).toLocaleDateString('pl-PL')}
            </p>
          </div>
        </div>
      )}

      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-white/15 text-xs tracking-[0.2em] uppercase font-sans">
          Strona stworzona w <a href="/" className="hover:text-white/40 transition-colors" style={{ color: `${color}60` }}>YetiMode</a>
        </p>
      </footer>
    </div>
  )
}
