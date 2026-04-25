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
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-white mb-2">Strona niedostępna</h1>
        <p className="text-gray-500">To wydarzenie nie istnieje lub nie zostało jeszcze opublikowane.</p>
      </div>
    </div>
  )

  // Sprawdź visible_from — czy strona jest już dostępna
  if (event.visible_from) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const visibleDate = new Date(event.visible_from)
    if (today < visibleDate) {
      return (
        <div className="min-h-screen bg-[#07070f] flex items-center justify-center text-center px-4">
          <div>
            <p className="text-6xl mb-4">⏳</p>
            <h1 className="text-2xl font-bold text-white mb-2">Strona jeszcze niedostępna</h1>
            <p className="text-gray-500">Strona będzie dostępna od {new Date(event.visible_from).toLocaleDateString('pl-PL')}</p>
          </div>
        </div>
      )
    }
  }

  const color = event.primary_color || '#8b5cf6'
  const sections = event.visible_sections || {
    countdown: true, church: true, venue: true, description: true,
    rsvp: true, gallery: true, photobooth: true, schedule: true,
  }

  // Sprawdź deadline RSVP
  const rsvpExpired = event.rsvp_deadline
    ? new Date() > new Date(event.rsvp_deadline + 'T23:59:59')
    : false

  // Buduj zakładki na podstawie widocznych sekcji
  const tabs: { label: string; key: string }[] = [
    { label: 'Strona główna', key: 'home' },
    ...(!rsvpExpired && sections.rsvp ? [{ label: 'RSVP', key: 'rsvp' }] : []),
    ...(sections.schedule && (event.schedule?.length || 0) > 0 ? [{ label: 'Plan dnia', key: 'schedule' }] : []),
    ...(sections.photobooth ? [{ label: 'Foto Budka', key: 'photobooth' }] : []),
    ...(sections.gallery ? [{ label: 'Galeria', key: 'gallery' }] : []),
  ]

  const currentTab = tabs[activeTab]?.key || 'home'

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#07070f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-white text-sm truncate max-w-[140px]">{event.title}</span>
          {/* Desktop */}
          <div className="hidden md:flex gap-1">
            {tabs.map((tab, i) => (
              <button key={tab.key} onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === i ? 'text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
                style={activeTab === i ? { backgroundColor: color + '30', color } : {}}>
                {tab.label}
              </button>
            ))}
          </div>
          {/* Mobile */}
          <button className="md:hidden text-gray-400 text-sm font-medium flex items-center gap-1" onClick={() => setMenuOpen(!menuOpen)}>
            {tabs[activeTab]?.label} <span className="text-xs">▾</span>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0d0d18] border-t border-white/5 px-4 py-2">
            {tabs.map((tab, i) => (
              <button key={tab.key} onClick={() => { setActiveTab(i); setMenuOpen(false) }}
                className={`block w-full text-left py-3 text-sm font-medium border-b border-white/5 last:border-0 ${activeTab === i ? 'text-white' : 'text-gray-500'}`}
                style={activeTab === i ? { color } : {}}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {currentTab === 'home'      && <PublicHero event={event} sections={sections} onRSVP={() => { const idx = tabs.findIndex(t => t.key === 'rsvp'); if (idx >= 0) setActiveTab(idx) }} />}
      {currentTab === 'rsvp'      && <PublicRSVP event={event} />}
      {currentTab === 'schedule'  && <PublicSchedule event={event} />}
      {currentTab === 'photobooth'&& <PublicFotoBudka event={event} />}
      {currentTab === 'gallery'   && <PublicGallery event={event} />}

      {/* Info o wygaśnięciu RSVP */}
      {rsvpExpired && currentTab === 'home' && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
            <p className="text-amber-400 text-sm font-medium">⏰ Termin potwierdzenia obecności minął {new Date(event.rsvp_deadline!).toLocaleDateString('pl-PL')}</p>
          </div>
        </div>
      )}

      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
        Strona stworzona w <a href="/" className="font-semibold hover:text-gray-400 transition-colors" style={{ color }}>YetiMode</a>
      </footer>
    </div>
  )
}
